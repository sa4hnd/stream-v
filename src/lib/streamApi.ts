export const STREAM_API = 'https://sahnd-plus-api.vercel.app';

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

  // Try Vixsrc directly first (fastest, returns real m3u8)
  try {
    const vixUrl = `${STREAM_API}/api/streams/vixsrc/${apiType}/${tmdbId}${qs}`;
    const vixRes = await fetch(vixUrl);
    if (vixRes.ok) {
      const vixData = await vixRes.json();
      if (vixData.success && vixData.streams?.length) {
        const stream = vixData.streams[0];
        return {
          m3u8: stream.url,
          subtitles: stream.subtitles || [],
          provider: 'Vixsrc',
          headers: { Referer: 'https://vixsrc.to/' },
        };
      }
    }
  } catch {}

  // Fallback: try aggregate endpoint
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
          return {
            m3u8: playable.url,
            subtitles: playable.subtitles || [],
            provider: playable.provider || 'Unknown',
            headers: playable.headers || {},
          };
        }
      }
    }
  } catch {}

  throw new Error('No playable streams found');
}
