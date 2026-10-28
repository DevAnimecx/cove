import test from 'node:test';
import assert from 'node:assert/strict';
import { I18N_KEYS, LANGUAGE_LABELS, hasTranslation, t } from '../src/lib/i18n.ts';

const LANGUAGES = ['en', 'hi', 'es', 'de', 'ja', 'tr'];

test('ships labels and dictionaries for every supported language', () => {
  assert.deepEqual(Object.keys(LANGUAGE_LABELS).sort(), [...LANGUAGES].sort());
  assert.ok(I18N_KEYS.length >= 25);
  for (const lang of LANGUAGES) {
    for (const key of I18N_KEYS) {
      assert.ok(hasTranslation(lang, key), `${lang} is missing translation key "${key}"`);
    }
  }
});

test('translates real copy instead of returning dictionary keys', () => {
  assert.equal(t('en', 'tagline'), 'Your calm corner of the web.');
  assert.equal(t('es', 'tagline'), 'Tu rincón tranquilo en la web.');
  assert.notEqual(t('ja', 'settings'), 'settings');
  assert.match(t('hi', 'focusEngine'), /फ़ोकस/);
});

test('falls back to English for a missing key and to the key itself for unknowns', () => {
  assert.equal(t('de', 'definitely-not-a-key'), 'definitely-not-a-key');
  assert.equal(hasTranslation('de', 'definitely-not-a-key'), false);
  assert.equal(t('en', 'searchPlaceholder').includes('Search'), true);
});

test('every key is non-empty and free of accidental placeholder text', () => {
  for (const lang of LANGUAGES) {
    for (const key of I18N_KEYS) {
      const value = t(lang, key).trim();
      assert.ok(value.length > 0, `${lang}.${key} should not be empty`);
      assert.ok(!/TODO|FIXME|lorem ipsum/i.test(value), `${lang}.${key} contains placeholder text`);
    }
  }
});
