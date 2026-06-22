# Easymod - Nuvio Plugin

Questo repository contiene una collezione di plugin Nuvio per provider italiani di Film, Serie TV e Anime.

## Installazione su Nuvio

1. Apri **Nuvio**.
2. Vai in **Impostazioni** > **Plugin**.
3. Incolla questo URL:

```text
https://raw.githubusercontent.com/Eful97/Easymod/main/
```

4. Conferma l'aggiunta del plugin.

Se Nuvio mostra ancora una lista vecchia, rimuovi e reinserisci il plugin oppure attendi che la cache del manifest si aggiorni.

## Provider supportati

Versione manifest: `1.1.103`

| Provider | Contenuti | Note |
| --- | --- | --- |
| AnimeUnity | Anime, Film, Serie TV | Testato con catalogo TMDB/Kitsu e stagioni anime |
| AnimeWorld | Anime, Film, Serie TV | Testato con stagioni anime e varianti JP/ITA |
| AnimeSaturn | Anime, Film, Serie TV | Testato con stagioni anime e varianti JP/ITA |
| CB01 | Film | Integrato dai plugin ToastFlix; testato con film TMDB |
| Eurostreaming | Serie TV | Integrato dai plugin ToastFlix; testato con serie TMDB |
| VidxGo | Film, Serie TV | Disponibile come scraper singolo e nell'aggregatore |
| GuardaHD | Film, Serie TV | Testato con film TMDB |
| Guardoserie | Film, Serie TV | Richiede bypass Cloudflare lato server remoto |
| StreamingCommunity | Film, Serie TV | Testato con film TMDB |
| CinemaCity | Film, Serie TV | Testato con titoli presenti nel catalogo CinemaCity |
| AltadefinizioneStreaming | Film, Serie TV | Il sito sorgente puo richiedere accesso/gate Telegram |
| NetMirror | Film, Serie TV | Testato con film TMDB |

## Stato test scraping

Ultima verifica locale:

- Funzionanti con stream reali: GuardaHD, AnimeUnity, AnimeWorld, AnimeSaturn, CB01, Eurostreaming, VidxGo, StreamingCommunity, CinemaCity, NetMirror.
- Guardoserie: il path del bypass e corretto; per il test locale serve la dipendenza Python `scrapling`.
- AltadefinizioneStreaming: al momento l'API del sito risponde con gate Telegram (`401`), quindi puo non restituire stream senza accesso.

## Struttura

- `manifest.json`: manifest pubblico letto da Nuvio.
- `providers/`: bundle JavaScript pronti per Nuvio.
- `src/`: sorgenti dei provider.
- `scripts/nuvio-season-regression-test.js`: regression test per mapping stagioni anime.
- `build.js`: compila i sorgenti in `providers/`.

## Sviluppo

Installa le dipendenze:

```bash
npm install
```

Ricompila tutti i provider:

```bash
npm run build:all
```

Ricompila solo l'aggregatore:

```bash
npm run build
```

Esegui il regression test principale:

```bash
npm test
```
