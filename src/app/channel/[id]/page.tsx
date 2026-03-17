import { fetchChannels } from '@/lib/channels';
import ChannelPlayer from '@/components/ChannelPlayer';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const categories = await fetchChannels();
    const all = categories.flatMap((c) => c.channels);
    const ch = all.find((c) => c.id === params.id);
    if (ch) return { title: `${ch.name} - Live TV - SAHND+` };
  } catch {}
  return { title: 'Live TV - SAHND+' };
}

export default async function ChannelPage({ params }: Props) {
  let categories: Awaited<ReturnType<typeof fetchChannels>> = [];
  try {
    categories = await fetchChannels();
  } catch {}

  const allChannels = categories.flatMap((c) => c.channels);

  return <ChannelPlayer channelId={params.id} allChannels={allChannels} />;
}
