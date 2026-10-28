import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURATED_WALLPAPERS,
  DEFAULT_QUICKLINK_GROUPS,
  DEFAULT_QUICKLINKS,
  DEFAULT_RSS_FEEDS,
  STARTER_RSS_CATALOG,
  createDefaultSettings
} from '../src/lib/defaults.ts';

test('bundles exactly eight local, unique scenic wallpapers', () => {
  assert.equal(CURATED_WALLPAPERS.length, 8);
  assert.equal(new Set(CURATED_WALLPAPERS.map((scene) => scene.id)).size, 8);
  assert.equal(new Set(CURATED_WALLPAPERS.map((scene) => scene.localUrl)).size, 8);
  for (const scene of CURATED_WALLPAPERS) {
    assert.match(scene.localUrl, /^\/wallpapers\/[a-z0-9-]+\.jpg$/);
    assert.match(scene.accentHex, /^#[0-9a-f]{6}$/i);
    assert.ok(scene.recommendedTheme === 'dark' || scene.recommendedTheme === 'light');
    assert.ok(scene.luminance >= 0 && scene.luminance <= 1);
    assert.ok(scene.heroLuminance >= 0 && scene.heroLuminance <= 1);
    assert.ok(scene.unsplashUrl.startsWith('https://'));
    assert.ok(scene.css.length > 0);
  }
});

test('boots into the calm, local-first default contract', () => {
  const settings = createDefaultSettings();
  assert.equal(settings.version, 8);
  assert.equal(settings.theme, 'dark');
  assert.equal(settings.preset, 'cobalt');
  assert.ok(['en', 'hi', 'es', 'de', 'ja', 'tr'].includes(settings.language));
  assert.equal(settings.discoverOptIn, true);
  assert.equal(settings.rssOptIn, true);
  assert.equal(settings.background.cloud, undefined);
  assert.equal(settings.smartEngine.enabled, true);
  assert.equal(settings.smartEngine.autonomyMode, 'autonomous');
  assert.equal(settings.smartEngine.whisperMode, true);
  assert.equal(settings.focus.streakDays, 0);
  assert.deepEqual(settings.focus.history, []);
  assert.equal(settings.focus.totalFocusMinutes, 0);
  assert.ok(settings.weather.latitude >= -90 && settings.weather.latitude <= 90);
  assert.ok(settings.weather.longitude >= -180 && settings.weather.longitude <= 180);
});

test('ships real quick-link groups without duplicate identifiers', () => {
  assert.ok(DEFAULT_QUICKLINK_GROUPS.length >= 2);
  assert.equal(
    new Set(DEFAULT_QUICKLINK_GROUPS.map((group) => group.id)).size,
    DEFAULT_QUICKLINK_GROUPS.length
  );
  assert.ok(DEFAULT_QUICKLINKS.length >= 5);
  assert.equal(
    new Set(DEFAULT_QUICKLINKS.map((link) => link.id)).size,
    DEFAULT_QUICKLINKS.length
  );
  for (const link of DEFAULT_QUICKLINKS) {
    assert.match(link.url, /^https:\/\//);
    assert.ok(link.title.length > 0);
    assert.ok(
      DEFAULT_QUICKLINK_GROUPS.some((group) => group.id === link.groupId),
      `quick link ${link.title} points at a missing group`
    );
  }
});

test('RSS catalogues contain unique HTTPS feeds', () => {
  for (const feed of [...DEFAULT_RSS_FEEDS, ...STARTER_RSS_CATALOG]) {
    assert.match(feed.url, /^https:\/\//);
    assert.ok(feed.title.length > 0);
  }
  const starterUrls = STARTER_RSS_CATALOG.map((feed) => feed.url);
  assert.equal(new Set(starterUrls).size, starterUrls.length);
});
