const FAV_KEY = 'sahnd-fav-channels';

export const getFavoriteChannels = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(FAV_KEY);
  return data ? JSON.parse(data) : [];
};

export const isFavoriteChannel = (id: string): boolean => {
  return getFavoriteChannels().includes(id);
};

export const toggleFavoriteChannel = (id: string): boolean => {
  const favs = getFavoriteChannels();
  const idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    return false;
  } else {
    favs.push(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    return true;
  }
};
