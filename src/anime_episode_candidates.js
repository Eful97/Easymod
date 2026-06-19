"use strict";

const TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706";
const TMDB_TIMEOUT_MS = 5000;
const SEASON_COUNTS_TTL_MS = 60 * 60 * 1000;

const seasonCountsCache = new Map();
const seasonCountsInFlight = new Map();

function parsePositiveInt(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRequestedEpisode(value) {
  return parsePositiveInt(value) || 1;
}

function parseSeason(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getCached(map, key) {
  const entry = map.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    map.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCached(map, key, value, ttlMs) {
  map.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function extractTmdbId(mappingPayload, providerContext = null) {
  const candidates = [
    providerContext?.tmdbId,
    mappingPayload?.mappings?.ids?.tmdb,
    mappingPayload?.ids?.tmdb,
    mappingPayload?.tmdbId
  ];

  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (/^\d+$/.test(text)) return text;
    if (/^tmdb:\d+$/i.test(text)) return text.split(":")[1];
  }
  return null;
}

function extractImdbId(mappingPayload, providerContext = null) {
  const candidates = [
    providerContext?.imdbId,
    mappingPayload?.mappings?.ids?.imdb,
    mappingPayload?.ids?.imdb,
    mappingPayload?.imdbId
  ];

  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (/^tt\d+$/i.test(text)) return text;
  }
  return null;
}

function shouldRetrySeasonMappingWithImdb(lookup, mappingPayload, providerContext = null) {
  const provider = String(lookup?.provider || "").trim().toLowerCase();
  if (provider === "imdb") return false;

  const requestedSeason =
    parseSeason(lookup?.season) ??
    parseSeason(providerContext?.requestedSeason) ??
    parseSeason(mappingPayload?.requested?.season);
  if (!requestedSeason || requestedSeason <= 1) return false;

  return Boolean(extractImdbId(mappingPayload, providerContext));
}

function toAbsoluteEpisodeFromSeasonCounts(seasonCounts, season, episode) {
  const parsedEpisode = parsePositiveInt(episode);
  if (!parsedEpisode) return null;

  const parsedSeason = parseSeason(season);
  if (!parsedSeason || parsedSeason < 1) return parsedEpisode;
  if (parsedSeason === 1) return parsedEpisode;

  const seasons = Array.isArray(seasonCounts) ? seasonCounts : [];
  const current = seasons.find((s) => s?.season_number === parsedSeason);
  if (current && parsedEpisode > current.episode_count) {
    return parsedEpisode;
  }

  let absolute = parsedEpisode;
  let sawPreviousSeason = false;
  for (const s of seasons) {
    if (!Number.isInteger(s?.season_number) || !Number.isInteger(s?.episode_count)) continue;
    if (s.season_number < parsedSeason && s.season_number > 0) {
      absolute += s.episode_count;
      sawPreviousSeason = true;
    }
  }

  return sawPreviousSeason ? absolute : null;
}

async function fetchTmdbSeasonEpisodeCounts(tmdbId) {
  const key = String(tmdbId || "").trim();
  if (!TMDB_API_KEY || !/^\d+$/.test(key) || typeof fetch !== "function") return [];

  const cached = getCached(seasonCountsCache, key);
  if (cached !== undefined) return cached;
  if (seasonCountsInFlight.has(key)) return seasonCountsInFlight.get(key);

  const task = (async () => {
    const canUseAbortTimeout =
      typeof AbortController !== "undefined" &&
      typeof setTimeout === "function" &&
      typeof clearTimeout === "function";
    const timeoutController = canUseAbortTimeout ? new AbortController() : null;
    const timeoutId = timeoutController
      ? setTimeout(() => timeoutController.abort(), TMDB_TIMEOUT_MS)
      : null;
    try {
      const url = `https://api.themoviedb.org/3/tv/${encodeURIComponent(key)}?api_key=${TMDB_API_KEY}`;
      const fetchOptions = timeoutController ? { signal: timeoutController.signal } : undefined;
      const response = await fetch(url, fetchOptions);
      if (!response.ok) return setCached(seasonCountsCache, key, [], SEASON_COUNTS_TTL_MS);
      const payload = await response.json();
      const seasonCounts = Array.isArray(payload?.seasons)
        ? payload.seasons
            .map((season) => ({
              season_number: Number.parseInt(season?.season_number, 10),
              episode_count: Number.parseInt(season?.episode_count, 10)
            }))
            .filter(
              (season) =>
                Number.isInteger(season.season_number) &&
                season.season_number > 0 &&
                Number.isInteger(season.episode_count) &&
                season.episode_count > 0
            )
            .sort((a, b) => a.season_number - b.season_number)
        : [];
      return setCached(seasonCountsCache, key, seasonCounts, SEASON_COUNTS_TTL_MS);
    } catch {
      return setCached(seasonCountsCache, key, [], SEASON_COUNTS_TTL_MS);
    } finally {
      if (timeoutId !== null) clearTimeout(timeoutId);
      seasonCountsInFlight.delete(key);
    }
  })();

  seasonCountsInFlight.set(key, task);
  return task;
}

function resolveEpisodeFromMappingPayload(mappingPayload, fallbackEpisode) {
  const fromKitsu = parsePositiveInt(mappingPayload?.kitsu?.episode);
  if (fromKitsu) return fromKitsu;

  const fromRequested = parsePositiveInt(mappingPayload?.requested?.episode);
  if (fromRequested) return fromRequested;

  const fromTmdbRaw = parsePositiveInt(
    mappingPayload?.mappings?.tmdb_episode?.rawEpisodeNumber ||
      mappingPayload?.mappings?.tmdb_episode?.raw_episode_number ||
      mappingPayload?.mappings?.tmdbEpisode?.rawEpisodeNumber ||
      mappingPayload?.tmdb_episode?.rawEpisodeNumber ||
      mappingPayload?.tmdbEpisode?.rawEpisodeNumber
  );
  if (fromTmdbRaw) return fromTmdbRaw;

  return normalizeRequestedEpisode(fallbackEpisode);
}

async function resolveRequestedEpisodeCandidates(mappingPayload, fallbackEpisode, providerContext = null, options = {}) {
  const primaryEpisode = resolveEpisodeFromMappingPayload(mappingPayload, fallbackEpisode);
  const requestedSeason =
    parseSeason(providerContext?.requestedSeason) ??
    parseSeason(mappingPayload?.requested?.season) ??
    parseSeason(providerContext?.season);
  const requestedEpisode = normalizeRequestedEpisode(mappingPayload?.requested?.episode || fallbackEpisode);

  let absoluteEpisode = parsePositiveInt(providerContext?.absoluteEpisode);
  if (!absoluteEpisode && requestedSeason && requestedSeason > 1) {
    const tmdbId = extractTmdbId(mappingPayload, providerContext);
    const seasonCounts = Array.isArray(options.seasonCounts)
      ? options.seasonCounts
      : await fetchTmdbSeasonEpisodeCounts(tmdbId);
    absoluteEpisode = toAbsoluteEpisodeFromSeasonCounts(seasonCounts, requestedSeason, requestedEpisode);
  }

  const ordered = [];
  if (absoluteEpisode && requestedSeason && requestedSeason > 1 && absoluteEpisode !== primaryEpisode) {
    ordered.push(absoluteEpisode, primaryEpisode);
  } else {
    ordered.push(primaryEpisode, absoluteEpisode);
  }

  const seen = new Set();
  return ordered
    .map(parsePositiveInt)
    .filter((episode) => {
      if (!episode || seen.has(episode)) return false;
      seen.add(episode);
      return true;
    });
}

module.exports = {
  extractImdbId,
  resolveEpisodeFromMappingPayload,
  resolveRequestedEpisodeCandidates,
  shouldRetrySeasonMappingWithImdb,
  toAbsoluteEpisodeFromSeasonCounts
};
