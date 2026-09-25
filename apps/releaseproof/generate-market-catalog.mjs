import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const territoryInfo = JSON.parse(await fs.readFile(path.join(root, 'data/cldr/territoryInfo.json'), 'utf8')).supplemental.territoryInfo;
const containment = JSON.parse(await fs.readFile(path.join(root, 'data/cldr/territoryContainment.json'), 'utf8')).supplemental.territoryContainment;
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const regions = [
  ['019', 'Americas'],
  ['002', 'Africa'],
  ['150', 'Europe'],
  ['142', 'Asia'],
  ['009', 'Oceania']
];
const starterLocaleOverrides = new Map([['US', 'en'], ['GB', 'en'], ['IN', 'en'], ['BR', 'pt'], ['DE', 'de'], ['JP', 'ja']]);

function inRegion(group, territory, visited = new Set()) {
  if (visited.has(group)) return false;
  visited.add(group);
  return (containment[group]?._contains || []).some(child => child === territory || inRegion(child, territory, visited));
}

function territoryRegion(territory) {
  return regions.find(([group]) => inRegion(group, territory))?.[1] || 'Other';
}

function normalizedLanguageTag(language) {
  try { return Intl.getCanonicalLocales(language.replaceAll('_', '-'))[0]; }
  catch { return null; }
}

function languagesFor(territory) {
  const populations = Object.entries(territoryInfo[territory]?.languagePopulation || {})
    .map(([language, info]) => {
      const tag = normalizedLanguageTag(language);
      return tag && tag.toLowerCase() !== 'und'
        ? { tag, population: Number(info._populationPercent) || 0, official: /^official/.test(info._officialStatus || '') }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.official) - Number(a.official) || b.population - a.population || a.tag.localeCompare(b.tag));
  const seen = new Set();
  const distinct = populations.filter(item => {
    const key = item.tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!distinct.length) return [{ tag: 'und', language: 'Language not specified' }];
  const primary = distinct[0];
  const alternatives = distinct.filter(item => item.official || item.population >= 15).slice(0, 5);
  const selected = [primary, ...alternatives.filter(item => item.tag.toLowerCase() !== primary.tag.toLowerCase())];
  return selected.map(item => ({ tag: item.tag, language: languageNames.of(item.tag) || item.tag }));
}

const aggregateCodes = new Set(Object.entries(containment)
  .filter(([code, data]) => code.endsWith('-status-grouping') || data._grouping === 'true')
  .map(([code]) => code.replace(/-status-grouping$/, '')));

const catalog = [];
for (const territory of Object.keys(territoryInfo).filter(code => /^[A-Z]{2}$/.test(code)).sort()) {
  if (aggregateCodes.has(territory)) continue;
  const country = countryNames.of(territory);
  if (!country || country === territory || /^unknown region$/i.test(country)) continue;
  const locales = languagesFor(territory);
  const preferred = starterLocaleOverrides.get(territory);
  if (preferred) {
    const index = locales.findIndex(item => item.tag.toLowerCase() === preferred);
    if (index >= 0) locales.unshift(...locales.splice(index, 1));
  }
  locales.forEach((item, index) => {
    const locale = item.tag === 'und' ? `und-${territory}` : `${item.tag}-${territory}`;
    try { Intl.getCanonicalLocales(locale); } catch { return; }
    const id = index === 0 ? territory.toLowerCase() : `${territory}-${item.tag}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    catalog.push({ id, country, countryCode: territory, region: territoryRegion(territory), locale, language: item.language });
  });
}

catalog.sort((a, b) => a.country.localeCompare(b.country, 'en') || a.locale.localeCompare(b.locale, 'en'));
const output = `// Generated from Unicode CLDR 48.2 supplemental territory and language data. See data/cldr/LICENSE.\nexport const marketCatalog = ${JSON.stringify(catalog, null, 2)};\n`;
await fs.writeFile(path.join(root, 'public/market-catalog.js'), output);
console.log(JSON.stringify({ territories: new Set(catalog.map(item => item.countryCode)).size, locales: catalog.length, path: 'public/market-catalog.js' }));
