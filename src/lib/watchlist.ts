import { WatchlistItem } from '@/types';

const WATCHLIST_KEY = 'movie-stream-watchlist';

export const getWatchlist = (): WatchlistItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WATCHLIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const addToWatchlist = (item: WatchlistItem): void => {
  const list = getWatchlist();
  if (!list.find((i) => i.id === item.id && i.type === item.type)) {
    list.push({ ...item, addedAt: Date.now() });
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
};

export const removeFromWatchlist = (id: number, type: 'movie' | 'tv'): void => {
  const list = getWatchlist().filter((i) => !(i.id === id && i.type === type));
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
};

export const isInWatchlist = (id: number, type: 'movie' | 'tv'): boolean => {
  return getWatchlist().some((i) => i.id === id && i.type === type);
};
