'use client';

import MyTVPlayer from '@/components/MyTVPlayer';

interface Props {
  streamUrl: string;
  title: string;
  poster: string;
}

export default function MyTVMoviePlayer({ streamUrl, title, poster }: Props) {
  return <MyTVPlayer streamUrl={streamUrl} title={title} poster={poster} />;
}
