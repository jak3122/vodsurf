export function timerSettingsToSeconds({ h, m, s }) {
  const seconds = Number(h) * 60 * 60 + Number(m) * 60 + Number(s);
  return seconds;
}

export function sumStats(stats, selectedChannels) {
  stats = stats.filter((stat) => selectedChannels.includes(stat.channelId));
  const channels = stats.length;

  stats = stats.reduce(
    (prev, curr) => ({
      views: prev.views + curr.views,
      duration: prev.duration + curr.duration,
      hours: Math.round(prev.hours + curr.duration / 60 / 60),
      videos: prev.videos + curr.videos,
    }),
    {
      views: 0,
      duration: 0,
      hours: 0,
      videos: 0,
    }
  );

  return {
    ...stats,
    channels,
  };
}
