import { STREAM_API } from './streamApi';
import { ChannelCategory } from '@/types';

export async function fetchChannels(): Promise<ChannelCategory[]> {
  // Use server-cached channels (tokens from Cloud Run's IP)
  // Website streams go through Cloud Run's /proxy endpoint (same IP = tokens work)
  const res = await fetch(`${STREAM_API}/api/channels`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch channels');
  const data = await res.json();
  if (!data.success) throw new Error('Channel API error');
  return data.categories;
}
