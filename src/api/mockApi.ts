import type { Item, ItemDetail } from '../features/items/types';

// ─── Seed Data ──────────────────────────────────────────────────────────────────

export const ITEMS: Item[] = [
  { id: '1', title: 'Nebula Engine', subtitle: 'Real-time rendering core', icon: '🌌' },
  { id: '2', title: 'Quantum Parser', subtitle: 'Ultra-fast data parser', icon: '⚛️' },
  { id: '3', title: 'Photon Cache', subtitle: 'Edge caching layer', icon: '💡' },
  { id: '4', title: 'Gravity ORM', subtitle: 'Type-safe database toolkit', icon: '🪐' },
  { id: '5', title: 'Prism Auth', subtitle: 'Zero-trust auth framework', icon: '🔐' },
  { id: '6', title: 'Flux Analytics', subtitle: 'Real-time analytics engine', icon: '📊' },
];

const DETAILS: Record<string, ItemDetail> = {
  '1': {
    id: '1',
    title: 'Nebula Engine',
    subtitle: 'Real-time rendering core',
    icon: '🌌',
    description:
      'Nebula Engine is a cutting-edge real-time rendering pipeline designed for modern GPU architectures. It supports deferred shading, volumetric lighting, and WebGPU-based compute shaders for unparalleled performance in the browser.',
    stats: [
      { label: 'FPS Target', value: '120' },
      { label: 'Draw Calls', value: '< 200' },
      { label: 'Shader Lang', value: 'WGSL' },
      { label: 'Bundle Size', value: '42 KB' },
    ],
    tags: ['rendering', 'webgpu', 'real-time', 'shaders'],
    createdAt: '2024-06-15',
  },
  '2': {
    id: '2',
    title: 'Quantum Parser',
    subtitle: 'Ultra-fast data parser',
    icon: '⚛️',
    description:
      'Quantum Parser uses SIMD-accelerated parsing algorithms to process structured data at speeds exceeding 1 GB/s. Built with streaming in mind, it handles JSON, CSV, and Protocol Buffers in a unified API.',
    stats: [
      { label: 'Throughput', value: '1.2 GB/s' },
      { label: 'Formats', value: '3' },
      { label: 'Memory', value: '< 8 MB' },
      { label: 'Latency', value: '0.3 ms' },
    ],
    tags: ['parser', 'performance', 'streaming', 'simd'],
    createdAt: '2024-08-22',
  },
  '3': {
    id: '3',
    title: 'Photon Cache',
    subtitle: 'Edge caching layer',
    icon: '💡',
    description:
      'Photon Cache is a distributed edge-caching solution that intelligently pre-warms and invalidates caches at the CDN level. It supports stale-while-revalidate patterns and provides sub-millisecond cache hits globally.',
    stats: [
      { label: 'Hit Rate', value: '99.7%' },
      { label: 'Regions', value: '42' },
      { label: 'TTL Range', value: '1s–24h' },
      { label: 'P99 Latency', value: '0.8 ms' },
    ],
    tags: ['caching', 'cdn', 'edge', 'distributed'],
    createdAt: '2024-03-10',
  },
  '4': {
    id: '4',
    title: 'Gravity ORM',
    subtitle: 'Type-safe database toolkit',
    icon: '🪐',
    description:
      'Gravity ORM provides fully type-safe database queries with zero runtime overhead. Its compile-time query validator catches errors before deployment, and its migration engine handles schema evolution with confidence.',
    stats: [
      { label: 'Type Safety', value: '100%' },
      { label: 'Databases', value: '5' },
      { label: 'Migrations', value: 'Auto' },
      { label: 'Query Perf', value: '< 2 ms' },
    ],
    tags: ['database', 'orm', 'typescript', 'migrations'],
    createdAt: '2024-01-05',
  },
  '5': {
    id: '5',
    title: 'Prism Auth',
    subtitle: 'Zero-trust auth framework',
    icon: '🔐',
    description:
      'Prism Auth implements zero-trust authentication and authorization using hardware-backed cryptographic tokens. It supports OAuth 2.1, FIDO2/WebAuthn, and provides seamless SSO integration out of the box.',
    stats: [
      { label: 'Protocols', value: '4' },
      { label: 'MFA Support', value: 'Yes' },
      { label: 'Auth Time', value: '< 50 ms' },
      { label: 'Compliance', value: 'SOC2' },
    ],
    tags: ['auth', 'security', 'zero-trust', 'oauth'],
    createdAt: '2024-04-18',
  },
  '6': {
    id: '6',
    title: 'Flux Analytics',
    subtitle: 'Real-time analytics engine',
    icon: '📊',
    description:
      'Flux Analytics processes billions of events in real time, providing instant dashboards and alerting. Its columnar storage engine allows sub-second ad-hoc queries over petabytes of historical data.',
    stats: [
      { label: 'Events/sec', value: '2M+' },
      { label: 'Query Time', value: '< 500 ms' },
      { label: 'Retention', value: '90 days' },
      { label: 'Integrations', value: '25+' },
    ],
    tags: ['analytics', 'real-time', 'big-data', 'dashboards'],
    createdAt: '2024-09-30',
  },
};

// ─── Mock API ───────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Simulates fetching the items list (fast). */
export async function fetchItems(): Promise<Item[]> {
  await delay(300);
  return ITEMS;
}

/** Simulates fetching a single item's full detail (slow — mimics real API). */
export async function fetchItemDetail(id: string): Promise<ItemDetail> {
  await delay(1200);
  const detail = DETAILS[id];
  if (!detail) {
    throw new Error(`Item with id "${id}" not found.`);
  }
  return detail;
}
