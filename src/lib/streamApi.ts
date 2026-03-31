export const STREAM_API = 'https://sahnd-plus-api.onrender.com';

export interface StreamResult {
  m3u8: string;
  subtitles: any[];
  provider: string;
  headers: Record<string, string>;
}

export async function fetchStream(
  type: 'movie' | 'tv',
  tmdbId: number,
  season?: number,
  episode?: number
): Promise<StreamResult> {
  const apiType = type === 'tv' ? 'series' : 'movie';
  const qs = type === 'tv' && season && episode ? `?season=${season}&episode=${episode}` : '';

  // 1. Scrape vixsrc via our own Vercel API route (Vercel IPs pass Cloudflare)
  try {
    const params = new URLSearchParams({ id: String(tmdbId), type });
    if (type === 'tv' && season && episode) {
      params.set('s', String(season));
      params.set('e', String(episode));
    }
    const scrapeRes = await fetch(`/api/scrape-vixsrc?${params}`);
    if (scrapeRes.ok) {
      const data = await scrapeRes.json();
      if (data.success && data.masterPlaylistUrl) {
        const referer = data.referer || 'https://vixsrc.to/';
        return {
          m3u8: `${STREAM_API}/proxy/stream.m3u8?url=${encodeURIComponent(data.masterPlaylistUrl)}&referer=${encodeURIComponent(referer)}`,
          subtitles: [],
          provider: 'Vixsrc',
          headers: {},
        };
      }
    }
  } catch {}

  // 2. Fallback: server-side vixsrc (works if Render IP isn't blocked)
  try {
    const vixUrl = `${STREAM_API}/api/streams/vixsrc/${apiType}/${tmdbId}${qs}`;
    const vixRes = await fetch(vixUrl);
    if (vixRes.ok) {
      const vixData = await vixRes.json();
      if (vixData.success && vixData.streams?.length) {
        const stream = vixData.streams[0];
        const referer = stream.headers?.Referer || 'https://vixsrc.to/';
        return {
          m3u8: `${STREAM_API}/proxy/stream.m3u8?url=${encodeURIComponent(stream.url)}&referer=${encodeURIComponent(referer)}`,
          subtitles: stream.subtitles || [],
          provider: 'Vixsrc',
          headers: {},
        };
      }
    }
  } catch {}

  // 3. Fallback: aggregate endpoint (all providers)
  try {
    const url = `${STREAM_API}/api/streams/${apiType}/${tmdbId}${qs}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.streams?.length) {
        const playable = data.streams.find(
          (s: any) => typeof s.url === 'string' && (s.url.includes('playlist') || s.url.includes('.m3u8'))
        );
        if (playable) {
          const referer = playable.headers?.Referer || '';
          return {
            m3u8: referer
              ? `${STREAM_API}/proxy/stream.m3u8?url=${encodeURIComponent(playable.url)}&referer=${encodeURIComponent(referer)}`
              : playable.url,
            subtitles: playable.subtitles || [],
            provider: playable.provider || 'Unknown',
            headers: {},
          };
        }
      }
    }
  } catch {}

  throw new Error('No playable streams found');
}
