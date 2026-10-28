import type {
  CountdownItem,
  CoveSettings,
  LanguageCode,
  NoteItem,
  QuickLinkGroup,
  QuickLinkItem,
  ReadLaterItem,
  RssFeedSource,
  TabSession
} from './types';

export interface CuratedScene {
  id: string;
  label: string;
  subtitle: string;
  localUrl: string;
  recommendedTheme: 'dark' | 'light';
  luminance: number;
  heroLuminance: number;
  accentHex: string;
  css: string;
  unsplashUrl: string;
}

/**
 * 8 bespoke 4K-grade local scenic wallpapers bundled directly inside Cove (0 network calls)
 */
export const CURATED_WALLPAPERS: CuratedScene[] = [
  {
    id: 'alpine-mist',
    label: 'Alpine Mist',
    subtitle: 'Mirror glacial lake at dawn',
    localUrl: '/wallpapers/alpine-mist.jpg',
    recommendedTheme: 'light',
    luminance: 0.64,
    heroLuminance: 0.74,
    accentHex: '#4f8ea8',
    css: 'linear-gradient(160deg, #dde5ed 0%, #c8d4e0 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'sheltered-cove',
    label: 'Sheltered Cove',
    subtitle: 'Still twilight bay & pine headlands',
    localUrl: '/wallpapers/sheltered-cove.jpg',
    recommendedTheme: 'dark',
    luminance: 0.28,
    heroLuminance: 0.34,
    accentHex: '#62b3b7',
    css: 'radial-gradient(ellipse at 20% 0%, rgba(95, 158, 160, 0.28) 0%, transparent 55%), linear-gradient(180deg, #1a2230 0%, #161a28 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'emerald-cloud',
    label: 'Summer Cumulus',
    subtitle: 'Sunlit meadow & cobalt sky',
    localUrl: '/wallpapers/emerald-cloud.jpg',
    recommendedTheme: 'dark',
    luminance: 0.49,
    heroLuminance: 0.56,
    accentHex: '#5aa6e8',
    css: 'linear-gradient(180deg, #1b5fa7 0%, #3a89c9 65%, #3f7c3c 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'twilight-cafe',
    label: 'Blue Hour Café',
    subtitle: 'Warm amber storefront in rain sheen',
    localUrl: '/wallpapers/twilight-cafe.jpg',
    recommendedTheme: 'dark',
    luminance: 0.21,
    heroLuminance: 0.19,
    accentHex: '#e09b56',
    css: 'radial-gradient(circle at 55% 50%, rgba(196, 128, 62, 0.22) 0%, transparent 60%), linear-gradient(180deg, #181a2c 0%, #121320 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'golden-crosswalk',
    label: 'Golden Crosswalk',
    subtitle: 'Architectural sunset & leaf shadows',
    localUrl: '/wallpapers/golden-crosswalk.jpg',
    recommendedTheme: 'dark',
    luminance: 0.31,
    heroLuminance: 0.38,
    accentHex: '#df9d63',
    css: 'linear-gradient(135deg, #3c2e26 0%, #1d1e24 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'midnight-fjord',
    label: 'Aurora Fjord',
    subtitle: '2am eye-safe indigo & seafoam',
    localUrl: '/wallpapers/midnight-fjord.jpg',
    recommendedTheme: 'dark',
    luminance: 0.17,
    heroLuminance: 0.22,
    accentHex: '#59c7a8',
    css: 'radial-gradient(ellipse at 60% 25%, rgba(95, 168, 152, 0.22) 0%, transparent 55%), linear-gradient(180deg, #121626 0%, #171a2b 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'zen-garden',
    label: 'Kyoto Veranda',
    subtitle: 'Rain mist over cedar & emerald moss',
    localUrl: '/wallpapers/zen-garden.jpg',
    recommendedTheme: 'dark',
    luminance: 0.25,
    heroLuminance: 0.29,
    accentHex: '#72b888',
    css: 'linear-gradient(160deg, #222b22 0%, #1a1f1b 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=85'
  },
  {
    id: 'pastel-horizon',
    label: 'Still Horizon',
    subtitle: 'Dawn periwinkle & peach sea glass',
    localUrl: '/wallpapers/pastel-horizon.jpg',
    recommendedTheme: 'light',
    luminance: 0.61,
    heroLuminance: 0.68,
    accentHex: '#7d8fd4',
    css: 'linear-gradient(180deg, #8fa4c8 0%, #ebd1c3 60%, #99acc9 100%)',
    unsplashUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1920&q=85'
  }
];

function detectDefaultTempUnit(): 'C' | 'F' {
  try {
    const lang = navigator.language || 'en-US';
    return lang === 'en-US' || lang === 'en-LR' || lang === 'my-MM' ? 'F' : 'C';
  } catch {
    return 'C';
  }
}

/**
 * Picks the initial UI language from the browser's own locale so first-run
 * users get a dictionary they can read. English stays the global default.
 */
function detectDefaultLanguage(): LanguageCode {
  try {
    const lang = navigator.language || '';
    if (lang.toLowerCase().startsWith('tr')) return 'tr';
  } catch {
    // ignore
  }
  return 'en';
}

/**
 * Resolves an honest initial city/coordinates from the browser's real IANA timezone
 * before optional browser Geolocation or user city search.
 */
function detectLocationFromTimezone(): { city: string; latitude: number; longitude: number } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const map: Record<string, { city: string; latitude: number; longitude: number }> = {
      'Asia/Calcutta': { city: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
      'Asia/Kolkata': { city: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
      'America/New_York': { city: 'New York', latitude: 40.7128, longitude: -74.006 },
      'America/Chicago': { city: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
      'America/Denver': { city: 'Denver', latitude: 39.7392, longitude: -104.9903 },
      'America/Los_Angeles': { city: 'San Francisco', latitude: 37.7749, longitude: -122.4194 },
      'Europe/London': { city: 'London', latitude: 51.5072, longitude: -0.1276 },
      'Europe/Paris': { city: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      'Europe/Berlin': { city: 'Berlin', latitude: 52.52, longitude: 13.405 },
      'Europe/Istanbul': { city: 'İstanbul', latitude: 41.0082, longitude: 28.9784 },
      'Asia/Tokyo': { city: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
      'Asia/Singapore': { city: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
      'Asia/Dubai': { city: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
      'Australia/Sydney': { city: 'Sydney', latitude: -33.8688, longitude: 151.2093 }
    };
    if (map[tz]) return map[tz];
  } catch {
    // ignore
  }
  return { city: 'London', latitude: 51.5072, longitude: -0.1276 };
}

export function createDefaultSettings(): CoveSettings {
  const initialLoc = detectLocationFromTimezone();
  return {
    version: 8,
    onboardingDismissed: false,
    userName: '',
    language: detectDefaultLanguage(),
    theme: 'dark',
    preset: 'cobalt',
    layoutMode: 'dashboard',
    clockStyle: 'editorial',
    typography: {
      fontPair: 'swiss',
      uiScale: 'balanced',
      cornerStyle: 'balanced'
    },
    showHeroHeader: true,
    gridCols: 4,
    gridRows: 2,
    quickLinkCols: 4,
    quickLinkTileSize: 'M',
    staleHoursThreshold: 2,
    clock24h: false,
    clockShowSeconds: false,
    worldClocks: [
      { city: 'San Francisco', timeZone: 'America/Los_Angeles' },
      { city: 'London', timeZone: 'Europe/London' },
      { city: 'Tokyo', timeZone: 'Asia/Tokyo' }
    ],
    splitSearch: false,
    liveSearchSuggestions: true,
    instantAnswers: true,
    autoSnapshotSessions: true,
    useFaviconApi: true,
    readLaterFetchMetadataOptIn: true,
    rssOptIn: true,
    discoverOptIn: true,
    background: {
      type: 'cloud',
      solidColor: '#070b16',
      gradientId: 'sheltered-cove',
      curatedIndex: 1,
      fit: 'cover',
      dim: 0.2,
      blur: 0,
      brightness: 1.0,
      contrast: 1.02,
      vignette: 0.22,
      autoBrightness: true,
      chameleonAccent: false,
      unsplashOptIn: false
    },
    timeAware: {
      enabled: true,
      modeOverride: 'auto',
      workStartHour: 9,
      workEndHour: 18,
      workDays: [1, 2, 3, 4, 5]
    },
    smartEngine: {
      enabled: true,
      autonomyMode: 'autonomous',
      whisperMode: true,
      adaptiveSoundIntelligence: true,
      autonomousContext: true,
      adaptiveFocusDuration: true,
      smartSortLinks: true,
      showPulseSuggestions: true,
      markovPredictions: true,
      autoAdaptEngine: true,
      autoShapeBento: true,
      autoEvolveScene: true,
      smartCommandSort: true
    },
    weather: {
      enabledOptIn: true,
      city: initialLoc.city,
      latitude: initialLoc.latitude,
      longitude: initialLoc.longitude,
      unit: detectDefaultTempUnit()
    },
    focus: {
      workMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      intention: '',
      blockedDomains: ['reddit.com', 'x.com', 'youtube.com', 'instagram.com'],
      blockerActiveDuringFocus: true,
      blockerActiveDuringWorkHours: false,
      soundBell: true,
      ambientSound: 'none',
      ambientVolume: 0.45,
      soundMix: {
        waves: 0,
        rain: 0,
        cafe: 0,
        whitenoise: 0,
        wind: 0
      },
      neuralMode: 'off',
      neuralDepth: 'balanced',
      coupleSoundWithFocus: true,
      speechBlocker: true,
      streakDays: 0,
      lastCompletedDate: '',
      completedSessionsToday: 0,
      totalFocusMinutes: 0,
      history: []
    },
    searchEngines: [
      {
        id: 'ddg',
        name: 'DuckDuckGo',
        shortLabel: 'DDG',
        bang: '!ddg',
        aliases: ['!duck', '!duckduckgo'],
        domain: 'duckduckgo.com',
        urlTemplate: 'https://duckduckgo.com/?q={q}',
        enabled: true
      },
      {
        id: 'google',
        name: 'Google',
        shortLabel: 'G',
        bang: '!g',
        aliases: ['!google'],
        domain: 'google.com',
        urlTemplate: 'https://www.google.com/search?q={q}',
        enabled: true
      },
      {
        id: 'brave',
        name: 'Brave',
        shortLabel: 'BRV',
        bang: '!brv',
        aliases: ['!brave'],
        domain: 'search.brave.com',
        urlTemplate: 'https://search.brave.com/search?q={q}',
        enabled: false
      },
      {
        id: 'github',
        name: 'GitHub',
        shortLabel: 'GH',
        bang: '!gh',
        aliases: ['!github'],
        domain: 'github.com',
        urlTemplate: 'https://github.com/search?q={q}',
        enabled: true
      },
      {
        id: 'youtube',
        name: 'YouTube',
        shortLabel: 'YT',
        bang: '!yt',
        aliases: ['!youtube'],
        domain: 'youtube.com',
        urlTemplate: 'https://www.youtube.com/results?search_query={q}',
        enabled: false
      },
      {
        id: 'mdn',
        name: 'MDN Docs',
        shortLabel: 'MDN',
        bang: '!mdn',
        aliases: ['!mozilla'],
        domain: 'developer.mozilla.org',
        urlTemplate: 'https://developer.mozilla.org/en-US/search?q={q}',
        enabled: false
      },
      {
        id: 'wiki',
        name: 'Wikipedia',
        shortLabel: 'W',
        bang: '!w',
        aliases: ['!wiki', '!wikipedia'],
        domain: 'wikipedia.org',
        urlTemplate: 'https://en.wikipedia.org/w/index.php?search={q}',
        enabled: false
      }
    ],
    widgets: [
      { id: 'w-quicklinks', type: 'quicklinks', size: 'M', visible: true, order: 0 },
      { id: 'w-focus', type: 'focus', size: 'S', visible: true, order: 1 },
      { id: 'w-notes', type: 'notes', size: 'S', visible: true, order: 2 },
      { id: 'w-triage', type: 'triage', size: 'M', visible: true, order: 3 },
      { id: 'w-readlater', type: 'readlater', size: 'S', visible: true, order: 4 },
      { id: 'w-rss', type: 'rss', size: 'S', visible: true, order: 5 },
      { id: 'w-weather', type: 'weather', size: 'S', visible: false, order: 6 },
      { id: 'w-clock', type: 'clock', size: 'S', visible: false, order: 7 },
      { id: 'w-countdown', type: 'countdown', size: 'S', visible: false, order: 8 },
      {
        id: 'w-iframe',
        type: 'iframe',
        size: 'M',
        visible: false,
        order: 9,
        iframeTitle: 'Web Embed',
        iframeUrl: 'https://example.org'
      }
    ]
  };
}

export const DEFAULT_QUICKLINK_GROUPS: QuickLinkGroup[] = [
  { id: 'grp-work', name: 'Work', context: 'work' },
  { id: 'grp-dev', name: 'Dev', context: 'work' },
  { id: 'grp-personal', name: 'Personal', context: 'personal' },
  { id: 'grp-reading', name: 'Calm Web', context: 'both' }
];

export const DEFAULT_QUICKLINKS: QuickLinkItem[] = [
  { id: 'ql-google', title: 'Google', url: 'https://www.google.com', groupId: 'grp-work' },
  { id: 'ql-github', title: 'GitHub', url: 'https://github.com', groupId: 'grp-dev', badgeDomain: 'github.com' },
  { id: 'ql-gmail', title: 'Gmail', url: 'https://mail.google.com', groupId: 'grp-work', badgeDomain: 'mail.google.com' },
  { id: 'ql-linear', title: 'Linear', url: 'https://linear.app', groupId: 'grp-work' },
  { id: 'ql-figma', title: 'Figma', url: 'https://figma.com', groupId: 'grp-work' },
  { id: 'ql-notion', title: 'Notion', url: 'https://notion.so', groupId: 'grp-work' },
  { id: 'ql-youtube', title: 'YouTube', url: 'https://youtube.com', groupId: 'grp-personal' },
  { id: 'ql-wiki', title: 'Wikipedia', url: 'https://en.wikipedia.org', groupId: 'grp-reading' },
  { id: 'ql-hn', title: 'Hacker News', url: 'https://news.ycombinator.com', groupId: 'grp-reading' },
  { id: 'ql-mdn', title: 'MDN', url: 'https://developer.mozilla.org', groupId: 'grp-dev' }
];

/** Clean blank-slate starter note — zero mock tasks */
export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-today',
    title: 'Today',
    pinned: true,
    updatedAt: Date.now(),
    content: ''
  }
];

/** Zero pre-populated mock items — real data only */
export const DEFAULT_READ_LATER: ReadLaterItem[] = [];
export const DEFAULT_SESSIONS: TabSession[] = [];
export const DEFAULT_COUNTDOWNS: CountdownItem[] = [];

export const DEFAULT_RSS_FEEDS: RssFeedSource[] = [
  { id: 'rss-ars', title: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { id: 'rss-bbc', title: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }
];

export const STARTER_RSS_CATALOG: RssFeedSource[] = [
  { id: 'cat-hn', title: 'Hacker News', url: 'https://hnrss.org/frontpage?count=8' },
  { id: 'cat-lobsters', title: 'Lobsters', url: 'https://lobste.rs/rss' },
  { id: 'cat-verge', title: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { id: 'cat-df', title: 'Daring Fireball', url: 'https://daringfireball.net/feeds/main' },
  { id: 'cat-nasa', title: 'NASA Breaking', url: 'https://www.nasa.gov/news-release/feed/' }
];
