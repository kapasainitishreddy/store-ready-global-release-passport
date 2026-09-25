import test from 'node:test';
import assert from 'node:assert/strict';
import { marketCatalog } from '../public/market-catalog.js';

test('CLDR market catalog includes broad country and territory coverage with valid locale plans', () => {
  assert.ok(new Set(marketCatalog.map(market => market.countryCode)).size >= 250);
  assert.ok(marketCatalog.length >= 500);
  assert.equal(new Set(marketCatalog.map(market => market.id)).size, marketCatalog.length);
  for (const market of marketCatalog) {
    assert.match(market.countryCode, /^[A-Z]{2}$/);
    assert.equal(Intl.getCanonicalLocales(market.locale).length, 1);
    assert.ok(market.country && market.language && market.region);
  }
});

test('starter markets preserve their existing planning locale IDs', () => {
  const expected = { us: 'en-US', gb: 'en-GB', in: 'en-IN', br: 'pt-BR', de: 'de-DE', jp: 'ja-JP' };
  for (const [id, locale] of Object.entries(expected)) {
    assert.equal(marketCatalog.find(market => market.id === id)?.locale, locale);
  }
});

test('India has separate English and Hindi planning options', () => {
  assert.ok(marketCatalog.some(market => market.countryCode === 'IN' && market.locale === 'en-IN'));
  assert.ok(marketCatalog.some(market => market.countryCode === 'IN' && market.locale === 'hi-IN'));
});
