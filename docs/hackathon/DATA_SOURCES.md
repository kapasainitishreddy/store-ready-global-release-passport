# Market catalogue data

The searchable country and locale options are generated locally from the Unicode Common Locale Data Repository (CLDR) 48.2 files `territoryInfo.json` and `territoryContainment.json`. The source files are included under `apps/releaseproof/data/cldr/`; the generator writes the dependency-free browser module `apps/releaseproof/public/market-catalog.js`.

The catalogue contains 257 CLDR country/territory profiles and 585 locale choices. Language ordering uses CLDR official-language status and population estimates to suggest a default and alternative locales. Names and locale choices are planning aids, not a guarantee that a language is spoken by every user or that a particular store serves a territory.

CLDR does not provide the marketplace availability, app-store rules, local law, translation quality, SEO demand, keyword volume, or product-specific asset requirements displayed as human-review tasks in StoreReady. Verify those independently and attach current source evidence before launch.

Sources:

- [CLDR 48.2 stable release](https://cldr.unicode.org/index/downloads)
- [CLDR JSON distribution and project information](https://github.com/unicode-org/cldr-json)
- [Unicode LDML supplemental-data specification](https://unicode.org/reports/tr35/tr35-info.html)

CLDR data is distributed under the separate Unicode license included at `apps/releaseproof/data/cldr/LICENSE`. The public project also includes its MIT license for original StoreReady hackathon code. The CLDR data is not relicensed under MIT.
