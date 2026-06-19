"use strict";

const assert = require("node:assert/strict");
const {
  extractImdbId,
  resolveRequestedEpisodeCandidates,
  shouldRetrySeasonMappingWithImdb,
  toAbsoluteEpisodeFromSeasonCounts
} = require("../src/anime_episode_candidates.js");
const manifest = require("../manifest.json");

function supportsNuvioTvType(supportedTypes, requestedType) {
  const targetTypes =
    String(requestedType || "").toLowerCase() === "series"
      ? ["series", "tv", "anime"]
      : [String(requestedType || "").toLowerCase()];
  return supportedTypes.map((type) => String(type || "").toLowerCase()).some((type) => targetTypes.includes(type));
}

function normalizeNuvioMobileType(type) {
  const normalized = String(type || "").toLowerCase();
  return ["series", "show", "other"].includes(normalized) ? "tv" : normalized;
}

function supportsNuvioMobileType(supportedTypes, requestedType) {
  const normalizedType = normalizeNuvioMobileType(requestedType);
  return supportedTypes.map(normalizeNuvioMobileType).includes(normalizedType);
}

async function run() {
  const attackOnTitanSeasonCounts = [
    { season_number: 1, episode_count: 25 },
    { season_number: 2, episode_count: 12 }
  ];
  const mappingPayload = {
    requested: { season: 2, episode: 1 },
    kitsu: { episode: 1 },
    mappings: { ids: { tmdb: "1429" } }
  };
  const tmdbMappingPayload = {
    requested: { provider: "tmdb", externalId: "1429", season: 2, episode: 1 },
    mappings: { ids: { imdb: "tt2560140", tmdb: "1429" } }
  };

  assert.equal(
    toAbsoluteEpisodeFromSeasonCounts(attackOnTitanSeasonCounts, 2, 1),
    26
  );

  assert.deepEqual(
    await resolveRequestedEpisodeCandidates(mappingPayload, 1, null, {
      seasonCounts: attackOnTitanSeasonCounts
    }),
    [26, 1]
  );

  assert.deepEqual(
    await resolveRequestedEpisodeCandidates(
      mappingPayload,
      1,
      { requestedSeason: 2, absoluteEpisode: 26 },
      { seasonCounts: [] }
    ),
    [26, 1]
  );

  const originalFetch = global.fetch;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;
  try {
    global.setTimeout = undefined;
    global.clearTimeout = undefined;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        seasons: attackOnTitanSeasonCounts
      })
    });

    assert.deepEqual(
      await resolveRequestedEpisodeCandidates(
        {
          requested: { season: 2, episode: 1 },
          mappings: { ids: { tmdb: "900001429" } }
        },
        1
      ),
      [26, 1]
    );
  } finally {
    global.fetch = originalFetch;
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  }

  assert.equal(extractImdbId(tmdbMappingPayload), "tt2560140");
  assert.equal(
    shouldRetrySeasonMappingWithImdb(
      { provider: "tmdb", externalId: "1429", season: 2, episode: 1 },
      tmdbMappingPayload
    ),
    true
  );
  assert.equal(
    shouldRetrySeasonMappingWithImdb(
      { provider: "imdb", externalId: "tt2560140", season: 2, episode: 1 },
      tmdbMappingPayload
    ),
    false
  );

  const animeScrapers = manifest.scrapers.filter((scraper) =>
    ["AnimeUnity", "AnimeWorld", "AnimeSaturn"].includes(scraper.name)
  );
  assert.equal(animeScrapers.length, 3);

  for (const scraper of animeScrapers) {
    assert.equal(scraper.enabled, true, `${scraper.name} should be enabled in manifest`);
    assert.equal(
      supportsNuvioTvType(scraper.supportedTypes, "series"),
      true,
      `${scraper.name} should be selectable by NuvioTV for TMDB series`
    );
    assert.equal(
      supportsNuvioMobileType(scraper.supportedTypes, "series"),
      true,
      `${scraper.name} should be selectable by NuvioMobile for TMDB series`
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
