export type ThemeMode = 'system' | 'dark' | 'light';
export type ThemePreset = 'cobalt' | 'harbor' | 'nordic' | 'cedar' | 'dusk';
export type LayoutMode = 'dashboard' | 'discover' | 'ambient' | 'focus' | 'minimal' | 'blank';
export type ClockFaceStyle = 'editorial' | 'serif' | 'segmented' | 'bold';
export type FontPairId = 'swiss' | 'editorial' | 'humanist' | 'technical';
export type UiScaleId = 'compact' | 'balanced' | 'spacious';
export type CornerRadiusStyle = 'sharp' | 'balanced' | 'soft';
export type LanguageCode = 'en' | 'hi' | 'es' | 'de' | 'ja' | 'tr';
export type WidgetSize = 'S' | 'M' | 'L';
export type TimeContextMode = 'auto' | 'work' | 'personal';
export type AutonomyMode = 'autonomous' | 'assisted' | 'manual';

export interface TypographySettings {
  fontPair: FontPairId;
  uiScale: UiScaleId;
  cornerStyle: CornerRadiusStyle;
}

export type SettingsSectionId =
  | 'general'
  | 'typography'
  | 'appearance'
  | 'layout'
  | 'smart'
  | 'sound'
  | 'search'
  | 'focus'
  | 'privacy'
  | 'data';

export type WidgetType =
  | 'quicklinks'
  | 'triage'
  | 'notes'
  | 'focus'
  | 'readlater'
  | 'rss'
  | 'weather'
  | 'clock'
  | 'countdown'
  | 'iframe';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  size: WidgetSize;
  visible: boolean;
  order: number;
  pinned?: boolean;
  iframeUrl?: string;
  iframeTitle?: string;
}

export type BackgroundType = 'cloud' | 'wallpaper' | 'gradient' | 'solid' | 'local' | 'curated';
export type BackgroundFit = 'cover' | 'contain' | 'center';

export interface BackgroundConfig {
  type: BackgroundType;
  solidColor: string;
  gradientId: string;
  curatedIndex: number;
  localDataUrl?: string;
  fit: BackgroundFit;
  dim: number;
  blur: number;
  brightness: number;
  contrast: number;
  vignette: number;
  autoBrightness: boolean;
  chameleonAccent: boolean;
  unsplashOptIn: boolean;
}

export interface SearchEngine {
  id: string;
  name: string;
  shortLabel: string;
  bang: string;
  aliases?: string[];
  domain: string;
  urlTemplate: string;
  enabled: boolean;
  isCustom?: boolean;
}

export type QuickLinkContext = 'work' | 'personal' | 'both';

export interface QuickLinkGroup {
  id: string;
  name: string;
  context: QuickLinkContext;
}

export interface QuickLinkItem {
  id: string;
  title: string;
  url: string;
  groupId: string;
  customIcon?: string;
  badgeDomain?: string;
}

export interface BrowserTabItem {
  id: number;
  windowId: number;
  title: string;
  url: string;
  domain: string;
  favIconUrl?: string;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  muted: boolean;
  discarded: boolean;
  lastAccessed: number;
  estimatedRamMb: number;
  unreadCount: number;
  groupTitle?: string;
  source?: 'extension' | 'live-tab' | 'launched' | 'cove-peer';
}

export interface TabTriageSummary {
  totalTabs: number;
  audioTabs: BrowserTabItem[];
  duplicateGroups: { domain: string; tabs: BrowserTabItem[] }[];
  duplicateExtraCount: number;
  staleTabs: BrowserTabItem[];
  updateTabs: BrowserTabItem[];
  heavyTabs: BrowserTabItem[];
  computedInMs: number;
}

export interface TabSessionItem {
  url: string;
  title: string;
  domain: string;
  groupName?: string;
  pinned?: boolean;
}

export interface TabSession {
  id: string;
  name: string;
  createdAt: number;
  context: QuickLinkContext;
  isAutoSnapshot?: boolean;
  tabs: TabSessionItem[];
}

export interface ReadLaterItem {
  id: string;
  url: string;
  title: string;
  domain: string;
  siteName?: string;
  description?: string;
  contentHtml?: string;
  readingTimeMin?: number;
  image?: string;
  note?: string;
  addedAt: number;
  read?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: number;
}

export type SoundscapeId = 'none' | 'rain' | 'cafe' | 'whitenoise' | 'waves' | 'wind';
export type SoundTrackId = Exclude<SoundscapeId, 'none'>;
export type SoundLayerMix = Record<SoundTrackId, number>;

export type NeuralModeId = 'off' | 'deep_focus' | 'creative_flow' | 'calm_read' | 'unwind';
export type NeuralDepth = 'subtle' | 'balanced' | 'high';

export interface FocusSessionRecord {
  id: string;
  completedAt: number;
  minutes: number;
  intention: string;
  neuralMode?: NeuralModeId;
}

export interface FocusSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  intention: string;
  blockedDomains: string[];
  blockerActiveDuringFocus: boolean;
  blockerActiveDuringWorkHours: boolean;
  soundBell: boolean;
  ambientSound: SoundscapeId;
  ambientVolume: number;
  soundMix: SoundLayerMix;
  neuralMode: NeuralModeId;
  neuralDepth: NeuralDepth;
  coupleSoundWithFocus: boolean;
  speechBlocker: boolean;
  streakDays: number;
  lastCompletedDate: string;
  completedSessionsToday: number;
  totalFocusMinutes: number;
  history: FocusSessionRecord[];
}

export interface WeatherSettings {
  enabledOptIn: boolean;
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  unit: 'C' | 'F';
}

export interface WeatherHourlyPoint {
  time: string;
  tempC: number;
  weatherCode: number;
}

export interface WeatherDailyPoint {
  date: string;
  highC: number;
  lowC: number;
  weatherCode: number;
}

export interface WeatherCache {
  fetchedAt: number;
  city: string;
  tempC: number;
  feelsLikeC?: number;
  humidity?: number;
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  highC: number;
  lowC: number;
  weatherCode: number;
  windKmh: number;
  hourly?: WeatherHourlyPoint[];
  daily?: WeatherDailyPoint[];
}

export interface RssFeedSource {
  id: string;
  title: string;
  url: string;
}

export interface RssEntry {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: number;
}

export interface CountdownItem {
  id: string;
  label: string;
  targetDate: string;
  createdAt?: number;
}

export interface TimeAwareSettings {
  enabled: boolean;
  modeOverride: TimeContextMode;
  workStartHour: number;
  workEndHour: number;
  workDays: number[];
}

export type CircadianSlot =
  | 'dawn'
  | 'deep_morning'
  | 'afternoon'
  | 'evening'
  | 'late_night';

export type SmartSignalKind =
  | 'link'
  | 'tab'
  | 'search'
  | 'widget'
  | 'focus'
  | 'scene'
  | 'command'
  | 'sound';

export interface SmartSignalLogEntry {
  id: string;
  at: number;
  label: string;
  slotLabel: string;
  kind: SmartSignalKind;
  nodeKey?: string;
}

export interface AutopilotActionEntry {
  id: string;
  at: number;
  action: string;
  detail: string;
}

export interface SmartEngineSettings {
  enabled: boolean;
  autonomyMode: AutonomyMode;
  whisperMode: boolean;
  adaptiveSoundIntelligence: boolean;
  autonomousContext: boolean;
  adaptiveFocusDuration: boolean;
  smartSortLinks: boolean;
  showPulseSuggestions: boolean;
  markovPredictions: boolean;
  autoAdaptEngine: boolean;
  autoShapeBento: boolean;
  autoEvolveScene: boolean;
  smartCommandSort: boolean;
}

export interface SmartEngineMemory {
  version: number;
  totalSignals: number;
  lastDecayAt: number;
  hourlyActivity: number[]; // length 24
  hourlyFocus: number[]; // length 24
  hourlyWorkSignals: number[]; // length 24
  hourlyPersonalSignals: number[]; // length 24
  weeklyHeatmap: number[][]; // 7 days x 24 hours
  linkClicks: Record<string, number>;
  slotLinkScores: Record<string, Record<string, number>>;
  slotDomainScores: Record<string, Record<string, number>>;
  slotEngineScores: Record<string, Record<string, number>>;
  slotWidgetScores: Record<string, Record<string, number>>;
  slotSoundScores: Record<string, Record<string, number>>;
  slotNeuralScores: Record<string, Record<string, number>>;
  neuralFocusCompletions: Record<string, number>;
  slotSceneScores: Record<string, Record<number, number>>;
  commandScores: Record<string, number>;
  /** First-order Markov workflow transitions: fromNode -> { toNode: weight } */
  transitionMatrix: Record<string, Record<string, number>>;
  /** Second-order Markov workflow transitions: "prev2>>prev1" -> { toNode: weight } */
  biTransitionMatrix: Record<string, Record<string, number>>;
  nodeLabels: Record<string, { label: string; kind: SmartSignalKind; target?: string }>;
  prevNodeKey?: string;
  lastNodeKey?: string;
  lastNodeAt?: number;
  /** Reinforcement weights per pulse category based on accept/dismiss feedback */
  categoryAffinity: Record<string, number>;
  dismissCountByPulse: Record<string, number>;
  preferredFocusMinutes: number;
  dismissedPulseIds: Record<string, number>;
  acceptedCount: number;
  dismissedCount: number;
  autopilotLog: AutopilotActionEntry[];
  recentSignals: SmartSignalLogEntry[];
  lastUpdatedAt: number;
}

export interface CoveSettings {
  version: number;
  onboardingDismissed: boolean;
  userName: string;
  language: LanguageCode;
  theme: ThemeMode;
  preset: ThemePreset;
  layoutMode: LayoutMode;
  clockStyle: ClockFaceStyle;
  typography: TypographySettings;
  showHeroHeader: boolean;
  gridCols: number;
  gridRows: number;
  quickLinkCols: number;
  quickLinkTileSize: WidgetSize;
  staleHoursThreshold: number;
  clock24h: boolean;
  clockShowSeconds: boolean;
  worldClocks: { city: string; timeZone: string }[];
  splitSearch: boolean;
  liveSearchSuggestions: boolean;
  instantAnswers: boolean;
  autoSnapshotSessions: boolean;
  useFaviconApi: boolean;
  readLaterFetchMetadataOptIn: boolean;
  rssOptIn: boolean;
  discoverOptIn: boolean;
  background: BackgroundConfig;
  timeAware: TimeAwareSettings;
  smartEngine: SmartEngineSettings;
  weather: WeatherSettings;
  focus: FocusSettings;
  searchEngines: SearchEngine[];
  widgets: WidgetConfig[];
}

export interface CoveFullExport {
  exportedAt: string;
  app: 'Cove';
  version: number;
  settings: CoveSettings;
  smartMemory?: SmartEngineMemory;
  quickLinkGroups: QuickLinkGroup[];
  quickLinks: QuickLinkItem[];
  notes: NoteItem[];
  sessions: TabSession[];
  readLater: ReadLaterItem[];
  rssFeeds: RssFeedSource[];
  countdowns: CountdownItem[];
}
