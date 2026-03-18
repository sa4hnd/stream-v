import { StreamingSource } from '@/types';

// SAHND+ brand colors (hex without #)
const PRIMARY_COLOR = 'E50914';
const SECONDARY_COLOR = 'B20710';

export const streamingSources: StreamingSource[] = [
  {
    name: 'AutoEmbed',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://player.autoembed.cc/embed/${type}/${id}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/${type}/${id}`;
    },
  },
  {
    name: 'VixSrc',
    supportsEvents: true,
    supportsStartAt: true,
    getUrl: (type, id, season, episode, startAt) => {
      let url = `https://vixsrc.to/${type}/${id}`;
      if (type === 'tv' && season && episode) {
        url = `https://vixsrc.to/tv/${id}/${season}/${episode}`;
      }
      const params = new URLSearchParams();
      params.set('primaryColor', PRIMARY_COLOR);
      params.set('secondaryColor', SECONDARY_COLOR);
      params.set('autoplay', 'true');
      if (startAt && startAt > 10) {
        params.set('startAt', String(Math.floor(startAt)));
      }
      return `${url}?${params.toString()}`;
    },
  },
  {
    name: 'VidSrc CC',
    supportsStartAt: true,
    getUrl: (type, id, season, episode, startAt) => {
      let url = `https://vidsrc.cc/v2/embed/${type}/${id}`;
      if (type === 'tv' && season && episode) {
        url = `https://vidsrc.cc/v2/embed/${type}/${id}/${season}/${episode}`;
      }
      const params = new URLSearchParams();
      params.set('color', PRIMARY_COLOR);
      if (startAt && startAt > 10) {
        params.set('startAt', String(Math.floor(startAt)));
      }
      return `${url}?${params.toString()}`;
    },
  },
  {
    name: 'Embed.su',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://embed.su/embed/${type}/${id}/${season}/${episode}`;
      }
      return `https://embed.su/embed/${type}/${id}`;
    },
  },
  {
    name: 'VidSrc ICU',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://vidsrc.icu/embed/${type}/${id}/${season}/${episode}`;
      }
      return `https://vidsrc.icu/embed/${type}/${id}`;
    },
  },
  {
    name: 'Multiembed',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
      }
      return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    },
  },
  {
    name: 'Smashystream',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://player.smashy.stream/${type}/${id}?s=${season}&e=${episode}`;
      }
      return `https://player.smashy.stream/${type}/${id}`;
    },
  },
  {
    name: 'VidSrc PRO',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://vidsrc.pro/embed/${type}/${id}/${season}/${episode}`;
      }
      return `https://vidsrc.pro/embed/${type}/${id}`;
    },
  },
  {
    name: '2Embed',
    getUrl: (type, id, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${id}`;
    },
  },
];

export const getStreamUrl = (
  sourceIndex: number,
  type: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): string => {
  const source = streamingSources[sourceIndex] || streamingSources[0];
  return source.getUrl(type, id, season, episode);
};
