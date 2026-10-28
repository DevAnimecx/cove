import type {
  BackgroundConfig,
  CountdownItem,
  CoveSettings,
  FocusSessionRecord,
  FocusSettings,
  LanguageCode,
  NoteItem,
  QuickLinkGroup,
  QuickLinkItem,
  ReadLaterItem,
  RssFeedSource,
  SearchEngine,
  SmartEngineSettings,
  SoundLayerMix,
  TabSession,
  TabSessionItem,
  TimeAwareSettings,
  TypographySettings,
  WeatherSettings,
  WidgetConfig
} from './types';
import {
  isValidBang,
  normalizeBang,
  validateSearchUrlTemplate
} from './search.ts';

/**
 * Defensive import helpers for user-created Cove backups.
 *
 * Backups are untrusted input: they can be edited by hand, restored from an old
 * release, or crafted by a third party. These helpers keep every array bounded,
 * every URL on http(s), every setting inside its documented range, and every
 * enum on a known value. Nothing here touches the network or browser storage.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asTrimmedString(value: unknown, maxLength = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function asOptionalString(value: unknown, maxLength = 500): string | undefined {
  const text = asTrimmedString(value, maxLength);
  return text || undefined;
}

export function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function asFiniteNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  integer = false
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const bounded = Math.min(max, Math.max(min, value));
  return integer ? Math.round(bounded) : bounded;
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function asTimestamp(value: unknown, fallback = Date.now()): number {
  return asFiniteNumber(value, fallback, 0, 8.64e15, true);
}

/** Accept only credential-free http(s) URLs. */
export function asHttpUrl(value: unknown, maxLength = 2048): string | null {
  const text = asTrimmedString(value, maxLength);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Allow a bounded data:image or https image for locally imported cover art/icons. */
export function asImageUrl(value: unknown, maxLength = 512_000): string | undefined {
  const text = asTrimmedString(value, maxLength);
  if (!text) return undefined;
  if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+/=\s]+$/i.test(text)) {
    return text;
  }
  return asHttpUrl(text, maxLength) ?? undefined;
}

export function mapBounded<T>(
  value: unknown,
  maxItems: number,
  mapper: (item: unknown, index: number) => T | null
): T[] {
  if (!Array.isArray(value)) return [];
  const out: T[] = [];
  for (let index = 0; index < value.length && out.length < maxItems; index += 1) {
    const mapped = mapper(value[index], index);
    if (mapped) out.push(mapped);
  }
  return out;
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function sanitizeQuickLinkGroups(value: unknown): QuickLinkGroup[] {
  return uniqueById(
    mapBounded(value, 100, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const name = asTrimmedString(item.name, 80);
      if (!id || !name) return null;
      return {
        id,
        name,
        context: asEnum(item.context, ['work', 'personal', 'both'] as const, 'both')
      };
    })
  );
}

export function sanitizeQuickLinks(value: unknown): QuickLinkItem[] {
  return uniqueById(
    mapBounded(value, 500, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const title = asTrimmedString(item.title, 160);
      const url = asHttpUrl(item.url);
      const groupId = asTrimmedString(item.groupId, 80);
      if (!id || !title || !url || !groupId) return null;
      return {
        id,
        title,
        url,
        groupId,
        customIcon: asImageUrl(item.customIcon),
        badgeDomain: asOptionalString(item.badgeDomain, 253)
      };
    })
  );
}

export function sanitizeNotes(value: unknown): NoteItem[] {
  return uniqueById(
    mapBounded(value, 500, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const title = asTrimmedString(item.title, 160);
      if (!id || !title) return null;
      return {
        id,
        title,
        content: asTrimmedString(item.content, 100_000),
        pinned: asBoolean(item.pinned, false),
        updatedAt: asTimestamp(item.updatedAt)
      };
    })
  );
}

function sanitizeSessionTab(value: unknown): TabSessionItem | null {
  if (!isRecord(value)) return null;
  const url = asHttpUrl(value.url);
  if (!url) return null;
  return {
    url,
    title: asTrimmedString(value.title, 300) || url,
    domain: asTrimmedString(value.domain, 253) || 'web',
    groupName: asOptionalString(value.groupName, 80),
    pinned: typeof value.pinned === 'boolean' ? value.pinned : undefined
  };
}

export function sanitizeSessions(value: unknown): TabSession[] {
  return uniqueById(
    mapBounded(value, 200, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const name = asTrimmedString(item.name, 120);
      if (!id || !name) return null;
      return {
        id,
        name,
        createdAt: asTimestamp(item.createdAt),
        context: asEnum(item.context, ['work', 'personal', 'both'] as const, 'both'),
        isAutoSnapshot: typeof item.isAutoSnapshot === 'boolean' ? item.isAutoSnapshot : undefined,
        tabs: mapBounded(item.tabs, 100, sanitizeSessionTab)
      };
    })
  );
}

export function sanitizeReadLater(value: unknown): ReadLaterItem[] {
  return uniqueById(
    mapBounded(value, 500, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const url = asHttpUrl(item.url);
      const title = asTrimmedString(item.title, 300);
      if (!id || !url || !title) return null;
      return {
        id,
        url,
        title,
        domain: asTrimmedString(item.domain, 253) || 'web',
        siteName: asOptionalString(item.siteName, 120),
        description: asOptionalString(item.description, 5000),
        contentHtml: asOptionalString(item.contentHtml, 2_000_000),
        readingTimeMin: asFiniteNumber(item.readingTimeMin, 0, 0, 600, true) || undefined,
        image: asImageUrl(item.image, 2048),
        note: asOptionalString(item.note, 2000),
        addedAt: asTimestamp(item.addedAt),
        read: typeof item.read === 'boolean' ? item.read : undefined
      };
    })
  );
}

export function sanitizeRssFeeds(value: unknown): RssFeedSource[] {
  return uniqueById(
    mapBounded(value, 200, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const title = asTrimmedString(item.title, 160);
      const url = asHttpUrl(item.url);
      if (!id || !title || !url) return null;
      return { id, title, url };
    })
  );
}

export function sanitizeCountdowns(value: unknown): CountdownItem[] {
  return uniqueById(
    mapBounded(value, 200, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const label = asTrimmedString(item.label, 160);
      const targetDate = asTrimmedString(item.targetDate, 40);
      if (!id || !label || !targetDate) return null;
      return {
        id,
        label,
        targetDate,
        createdAt: typeof item.createdAt === 'number' ? asTimestamp(item.createdAt) : undefined
      };
    })
  );
}

function sanitizeWorldClocks(value: unknown, fallback: CoveSettings['worldClocks']) {
  const clocks = mapBounded(value, 12, (item) => {
    if (!isRecord(item)) return null;
    const city = asTrimmedString(item.city, 80);
    const timeZone = asTrimmedString(item.timeZone, 80);
    if (!city || !timeZone) return null;
    return { city, timeZone };
  });
  return clocks.length > 0 ? clocks : fallback;
}

function sanitizeTypography(value: unknown, fallback: TypographySettings): TypographySettings {
  if (!isRecord(value)) return { ...fallback };
  return {
    fontPair: asEnum(value.fontPair, ['swiss', 'editorial', 'humanist', 'technical'] as const, fallback.fontPair),
    uiScale: asEnum(value.uiScale, ['compact', 'balanced', 'spacious'] as const, fallback.uiScale),
    cornerStyle: asEnum(value.cornerStyle, ['sharp', 'balanced', 'soft'] as const, fallback.cornerStyle)
  };
}

function sanitizeBackground(value: unknown, fallback: BackgroundConfig): BackgroundConfig {
  if (!isRecord(value)) return { ...fallback };
  return {
    ...fallback,
    type: asEnum(
      value.type,
      ['cloud', 'wallpaper', 'gradient', 'solid', 'local', 'curated'] as const,
      fallback.type
    ),
    solidColor: asTrimmedString(value.solidColor, 64) || fallback.solidColor,
    gradientId: asTrimmedString(value.gradientId, 64) || fallback.gradientId,
    curatedIndex: asFiniteNumber(value.curatedIndex, fallback.curatedIndex, 0, 7, true),
    localDataUrl: asImageUrl(value.localDataUrl, 5_000_000) ?? fallback.localDataUrl,
    fit: asEnum(value.fit, ['cover', 'contain', 'center'] as const, fallback.fit),
    dim: asFiniteNumber(value.dim, fallback.dim, 0, 100),
    blur: asFiniteNumber(value.blur, fallback.blur, 0, 40),
    brightness: asFiniteNumber(value.brightness, fallback.brightness, 50, 150),
    contrast: asFiniteNumber(value.contrast, fallback.contrast, 50, 150),
    vignette: asFiniteNumber(value.vignette, fallback.vignette, 0, 100),
    autoBrightness: asBoolean(value.autoBrightness, fallback.autoBrightness),
    chameleonAccent: asBoolean(value.chameleonAccent, fallback.chameleonAccent),
    unsplashOptIn: asBoolean(value.unsplashOptIn, fallback.unsplashOptIn)
  };
}

function sanitizeTimeAware(value: unknown, fallback: TimeAwareSettings): TimeAwareSettings {
  if (!isRecord(value)) return { ...fallback };
  const workDays = Array.isArray(value.workDays)
    ? [...new Set(value.workDays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6))]
    : fallback.workDays;
  return {
    enabled: asBoolean(value.enabled, fallback.enabled),
    modeOverride: asEnum(value.modeOverride, ['auto', 'work', 'personal'] as const, fallback.modeOverride),
    workStartHour: asFiniteNumber(value.workStartHour, fallback.workStartHour, 0, 23, true),
    workEndHour: asFiniteNumber(value.workEndHour, fallback.workEndHour, 0, 23, true),
    workDays: workDays.length > 0 ? workDays : fallback.workDays
  };
}

function sanitizeSmartEngine(value: unknown, fallback: SmartEngineSettings): SmartEngineSettings {
  if (!isRecord(value)) return { ...fallback };
  return {
    enabled: asBoolean(value.enabled, fallback.enabled),
    autonomyMode: asEnum(value.autonomyMode, ['autonomous', 'assisted', 'manual'] as const, fallback.autonomyMode),
    whisperMode: asBoolean(value.whisperMode, fallback.whisperMode),
    adaptiveSoundIntelligence: asBoolean(value.adaptiveSoundIntelligence, fallback.adaptiveSoundIntelligence),
    autonomousContext: asBoolean(value.autonomousContext, fallback.autonomousContext),
    adaptiveFocusDuration: asBoolean(value.adaptiveFocusDuration, fallback.adaptiveFocusDuration),
    smartSortLinks: asBoolean(value.smartSortLinks, fallback.smartSortLinks),
    showPulseSuggestions: asBoolean(value.showPulseSuggestions, fallback.showPulseSuggestions),
    markovPredictions: asBoolean(value.markovPredictions, fallback.markovPredictions),
    autoAdaptEngine: asBoolean(value.autoAdaptEngine, fallback.autoAdaptEngine),
    autoShapeBento: asBoolean(value.autoShapeBento, fallback.autoShapeBento),
    autoEvolveScene: asBoolean(value.autoEvolveScene, fallback.autoEvolveScene),
    smartCommandSort: asBoolean(value.smartCommandSort, fallback.smartCommandSort)
  };
}

function sanitizeWeather(value: unknown, fallback: WeatherSettings): WeatherSettings {
  if (!isRecord(value)) return { ...fallback };
  return {
    enabledOptIn: asBoolean(value.enabledOptIn, fallback.enabledOptIn),
    city: asTrimmedString(value.city, 80) || fallback.city,
    country: asOptionalString(value.country, 80),
    latitude: asFiniteNumber(value.latitude, fallback.latitude, -90, 90),
    longitude: asFiniteNumber(value.longitude, fallback.longitude, -180, 180),
    unit: asEnum(value.unit, ['C', 'F'] as const, fallback.unit)
  };
}

function sanitizeSoundMix(value: unknown, fallback: SoundLayerMix): SoundLayerMix {
  if (!isRecord(value)) return { ...fallback };
  return {
    rain: asFiniteNumber(value.rain, fallback.rain, 0, 1),
    cafe: asFiniteNumber(value.cafe, fallback.cafe, 0, 1),
    whitenoise: asFiniteNumber(value.whitenoise, fallback.whitenoise, 0, 1),
    waves: asFiniteNumber(value.waves, fallback.waves, 0, 1),
    wind: asFiniteNumber(value.wind, fallback.wind, 0, 1)
  };
}

function sanitizeFocusRecord(value: unknown): FocusSessionRecord | null {
  if (!isRecord(value)) return null;
  const id = asTrimmedString(value.id, 80);
  if (!id) return null;
  return {
    id,
    completedAt: asTimestamp(value.completedAt),
    minutes: asFiniteNumber(value.minutes, 25, 1, 180, true),
    intention: asTrimmedString(value.intention, 200),
    neuralMode: typeof value.neuralMode === 'string' ? (value.neuralMode as FocusSessionRecord['neuralMode']) : undefined
  };
}

function sanitizeFocus(value: unknown, fallback: FocusSettings): FocusSettings {
  if (!isRecord(value)) return { ...fallback, history: [...fallback.history] };
  const blockedDomains = mapBounded(value.blockedDomains, 200, (entry) => {
    const domain = asTrimmedString(entry, 253).toLowerCase();
    return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : null;
  });
  return {
    ...fallback,
    workMinutes: asFiniteNumber(value.workMinutes, fallback.workMinutes, 1, 180, true),
    breakMinutes: asFiniteNumber(value.breakMinutes, fallback.breakMinutes, 1, 60, true),
    longBreakMinutes: asFiniteNumber(value.longBreakMinutes, fallback.longBreakMinutes, 1, 120, true),
    intention: asTrimmedString(value.intention, 200),
    blockedDomains: [...new Set(blockedDomains)],
    blockerActiveDuringFocus: asBoolean(value.blockerActiveDuringFocus, fallback.blockerActiveDuringFocus),
    blockerActiveDuringWorkHours: asBoolean(value.blockerActiveDuringWorkHours, fallback.blockerActiveDuringWorkHours),
    soundBell: asBoolean(value.soundBell, fallback.soundBell),
    ambientSound: asEnum(
      value.ambientSound,
      ['none', 'rain', 'cafe', 'whitenoise', 'waves', 'wind'] as const,
      fallback.ambientSound
    ),
    ambientVolume: asFiniteNumber(value.ambientVolume, fallback.ambientVolume, 0, 1),
    soundMix: sanitizeSoundMix(value.soundMix, fallback.soundMix),
    neuralMode: asEnum(
      value.neuralMode,
      ['off', 'deep_focus', 'creative_flow', 'calm_read', 'unwind'] as const,
      fallback.neuralMode
    ),
    neuralDepth: asEnum(value.neuralDepth, ['subtle', 'balanced', 'high'] as const, fallback.neuralDepth),
    coupleSoundWithFocus: asBoolean(value.coupleSoundWithFocus, fallback.coupleSoundWithFocus),
    speechBlocker: asBoolean(value.speechBlocker, fallback.speechBlocker),
    streakDays: asFiniteNumber(value.streakDays, fallback.streakDays, 0, 100_000, true),
    lastCompletedDate: asTrimmedString(value.lastCompletedDate, 20) || fallback.lastCompletedDate,
    completedSessionsToday: asFiniteNumber(
      value.completedSessionsToday,
      fallback.completedSessionsToday,
      0,
      1000,
      true
    ),
    totalFocusMinutes: asFiniteNumber(value.totalFocusMinutes, fallback.totalFocusMinutes, 0, 10_000_000, true),
    history: mapBounded(value.history, 500, sanitizeFocusRecord)
  };
}

function sanitizeSearchEngines(value: unknown, fallback: SearchEngine[]): SearchEngine[] {
  const mapped = mapBounded(value, 30, (item) => {
    if (!isRecord(item)) return null;
    const id = asTrimmedString(item.id, 80);
    const name = asTrimmedString(item.name, 80);
    const shortLabel = asTrimmedString(item.shortLabel, 24);
    const bang = normalizeBang(asTrimmedString(item.bang, 24));
    const urlTemplate = asTrimmedString(item.urlTemplate, 2048);
    if (!id || !name || !shortLabel || !isValidBang(bang)) return null;

    const template = validateSearchUrlTemplate(urlTemplate);
    if (!template.ok || !template.urlTemplate || !template.domain) return null;

    const rawAliases = Array.isArray(item.aliases) ? item.aliases : [];
    const aliases: string[] = [];
    for (const rawAlias of rawAliases.slice(0, 12)) {
      const alias = normalizeBang(asTrimmedString(rawAlias, 24));
      if (!isValidBang(alias) || alias === bang || aliases.includes(alias)) continue;
      aliases.push(alias);
      if (aliases.length >= 6) break;
    }

    return {
      id,
      name,
      shortLabel,
      bang,
      aliases,
      domain: template.domain,
      urlTemplate: template.urlTemplate,
      enabled: asBoolean(item.enabled, true),
      isCustom: typeof item.isCustom === 'boolean' ? item.isCustom : undefined
    } satisfies SearchEngine;
  });

  const engines: SearchEngine[] = [];
  const seenIds = new Set<string>();
  const seenBangs = new Set<string>();
  for (const engine of mapped) {
    if (!engine || seenIds.has(engine.id) || seenBangs.has(engine.bang)) continue;
    engine.aliases = (engine.aliases || []).filter((alias) => !seenBangs.has(alias));
    seenIds.add(engine.id);
    seenBangs.add(engine.bang);
    for (const alias of engine.aliases) seenBangs.add(alias);
    engines.push(engine);
  }

  if (engines.length === 0) return fallback;
  if (!engines.some((engine) => engine.enabled)) engines[0].enabled = true;
  return engines;
}

function sanitizeWidgets(value: unknown, fallback: WidgetConfig[]): WidgetConfig[] {
  const widgets = uniqueById(
    mapBounded(value, 50, (item) => {
      if (!isRecord(item)) return null;
      const id = asTrimmedString(item.id, 80);
      const type = asEnum(
        item.type,
        [
          'quicklinks',
          'triage',
          'notes',
          'focus',
          'readlater',
          'rss',
          'weather',
          'clock',
          'countdown',
          'iframe'
        ] as const,
        'notes'
      );
      if (!id) return null;
      return {
        id,
        type,
        title: asOptionalString(item.title, 80),
        size: asEnum(item.size, ['S', 'M', 'L'] as const, 'M'),
        visible: asBoolean(item.visible, true),
        order: asFiniteNumber(item.order, 0, 0, 1000, true),
        pinned: typeof item.pinned === 'boolean' ? item.pinned : undefined,
        iframeUrl: asHttpUrl(item.iframeUrl) ?? undefined,
        iframeTitle: asOptionalString(item.iframeTitle, 120)
      };
    })
  );
  return widgets.length > 0 ? widgets : fallback;
}

export function sanitizeImportedSettings(raw: unknown, base: CoveSettings): CoveSettings {
  if (!isRecord(raw)) return { ...base };
  const source = raw as Partial<CoveSettings>;
  const out: CoveSettings = { ...base, ...source };
  out.version = base.version;
  out.onboardingDismissed = asBoolean(raw.onboardingDismissed, base.onboardingDismissed);
  out.userName = asTrimmedString(raw.userName, 80);
  out.language = asEnum(raw.language, ['en', 'hi', 'es', 'de', 'ja', 'tr'] as const, base.language) as LanguageCode;
  out.theme = asEnum(raw.theme, ['system', 'dark', 'light'] as const, base.theme);
  out.preset = asEnum(raw.preset, ['cobalt', 'harbor', 'nordic', 'cedar', 'dusk'] as const, base.preset);
  out.layoutMode = asEnum(
    raw.layoutMode,
    ['dashboard', 'discover', 'ambient', 'focus', 'minimal', 'blank'] as const,
    base.layoutMode
  );
  out.clockStyle = asEnum(raw.clockStyle, ['editorial', 'serif', 'segmented', 'bold'] as const, base.clockStyle);
  out.typography = sanitizeTypography(raw.typography, base.typography);
  out.showHeroHeader = asBoolean(raw.showHeroHeader, base.showHeroHeader);
  out.gridCols = asFiniteNumber(raw.gridCols, base.gridCols, 1, 6, true);
  out.gridRows = asFiniteNumber(raw.gridRows, base.gridRows, 1, 6, true);
  out.quickLinkCols = asFiniteNumber(raw.quickLinkCols, base.quickLinkCols, 1, 8, true);
  out.quickLinkTileSize = asEnum(raw.quickLinkTileSize, ['S', 'M', 'L'] as const, base.quickLinkTileSize);
  out.staleHoursThreshold = asFiniteNumber(raw.staleHoursThreshold, base.staleHoursThreshold, 1, 720, true);
  out.clock24h = asBoolean(raw.clock24h, base.clock24h);
  out.clockShowSeconds = asBoolean(raw.clockShowSeconds, base.clockShowSeconds);
  out.worldClocks = sanitizeWorldClocks(raw.worldClocks, base.worldClocks);
  out.splitSearch = asBoolean(raw.splitSearch, base.splitSearch);
  out.liveSearchSuggestions = asBoolean(raw.liveSearchSuggestions, base.liveSearchSuggestions);
  out.instantAnswers = asBoolean(raw.instantAnswers, base.instantAnswers);
  out.autoSnapshotSessions = asBoolean(raw.autoSnapshotSessions, base.autoSnapshotSessions);
  out.useFaviconApi = asBoolean(raw.useFaviconApi, base.useFaviconApi);
  out.readLaterFetchMetadataOptIn = asBoolean(
    raw.readLaterFetchMetadataOptIn,
    base.readLaterFetchMetadataOptIn
  );
  out.rssOptIn = asBoolean(raw.rssOptIn, base.rssOptIn);
  out.discoverOptIn = asBoolean(raw.discoverOptIn, base.discoverOptIn);
  out.background = sanitizeBackground(raw.background, base.background);
  out.timeAware = sanitizeTimeAware(raw.timeAware, base.timeAware);
  out.smartEngine = sanitizeSmartEngine(raw.smartEngine, base.smartEngine);
  out.weather = sanitizeWeather(raw.weather, base.weather);
  out.focus = sanitizeFocus(raw.focus, base.focus);
  out.searchEngines = sanitizeSearchEngines(raw.searchEngines, base.searchEngines);
  out.widgets = sanitizeWidgets(raw.widgets, base.widgets);
  return out;
}
