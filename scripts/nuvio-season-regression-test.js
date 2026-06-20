"use strict";

const assert = require("node:assert/strict");
const {
  extractImdbId,
  resolveRequestedEpisodeCandidates,
  shouldRetrySeasonMappingWithImdb,
  toAbsoluteEpisodeFromSeasonCounts
} = require("../src/anime_episode_candidates.js");
const animeWorld = require("../src/animeworld/index.js");
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
  const jujutsuSearchHtml = `
    <div class="film-list">
      <a href="/play/jujutsu-kaisen.8nMP2" data-jtitle="Jujutsu Kaisen">Jujutsu Kaisen</a>
      <a href="/play/jujutsu-kaisen-ita.oV4fH" data-jtitle="Jujutsu Kaisen ITA">Jujutsu Kaisen (ITA)</a>
      <a href="/play/jujutsu-kaisen-2.M-Oiw" data-jtitle="Jujutsu Kaisen 2">Jujutsu Kaisen 2</a>
      <a href="/play/jujutsu-kaisen-0-movie.r6W2i" data-jtitle="Jujutsu Kaisen 0 Movie">Jujutsu Kaisen 0 Movie</a>
    </div>
  `;
  const jujutsuResults = animeWorld._private.parseAnimeWorldSearchResults(jujutsuSearchHtml);
  const demonSlayerSearchHtml = `
    <div class="film-list">
      <a href="/play/demon-slayer-kimetsu-no-yaiba.LrOb0"></a>
      <a href="/play/demon-slayer-kimetsu-no-yaiba.LrOb0" data-jtitle="Kimetsu no Yaiba">Demon Slayer: Kimetsu no Yaiba</a>
      <a href="/play/demon-slayer-kimetsu-no-yaiba-2.pbncD" data-jtitle="Kimetsu no Yaiba: Mugen Ressha-hen">Demon Slayer: Kimetsu no Yaiba Mugen Train Arc TV</a>
      <a href="/play/demon-slayer-kimetsu-no-yaiba-entertainment-district-arc.-HwgD" data-jtitle="Kimetsu no Yaiba: Yuukaku-hen">Demon Slayer: Kimetsu no Yaiba Entertainment District Arc</a>
      <a href="/play/demon-slayer-kimetsu-no-yaiba-ita.3z-5e" data-jtitle="Kimetsu no Yaiba">Demon Slayer: Kimetsu no Yaiba</a>
    </div>
  `;
  const demonSlayerResults = animeWorld._private.parseAnimeWorldSearchResults(
    demonSlayerSearchHtml
  );

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

  assert.deepEqual(
    animeWorld._private.selectAnimeWorldSearchPaths(jujutsuResults, ["Jujutsu Kaisen"], 1),
    ["/play/jujutsu-kaisen.8nMP2", "/play/jujutsu-kaisen-ita.oV4fH"]
  );
  assert.deepEqual(
    animeWorld._private.selectAnimeWorldSearchPaths(jujutsuResults, ["Jujutsu Kaisen"], 2),
    ["/play/jujutsu-kaisen-2.M-Oiw"]
  );
  assert.deepEqual(
    animeWorld._private.selectAnimeWorldSearchPaths(
      demonSlayerResults,
      ["Demon Slayer: Kimetsu no Yaiba"],
      1
    ),
    [
      "/play/demon-slayer-kimetsu-no-yaiba.LrOb0",
      "/play/demon-slayer-kimetsu-no-yaiba-ita.3z-5e"
    ]
  );
  assert.deepEqual(
    animeWorld._private.selectAnimeWorldSearchPaths(
      demonSlayerResults,
      ["Demon Slayer: Kimetsu no Yaiba"],
      2
    ),
    ["/play/demon-slayer-kimetsu-no-yaiba-2.pbncD"]
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
