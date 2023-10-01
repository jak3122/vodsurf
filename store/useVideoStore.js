"use client";
import { create } from "zustand";

function buildURL({ streamer, settings }) {
  const base = "/random";
  const params = [`streamer=${streamer}`, `strategy=${settings.strategy}`];
  if (settings.mode === "links" && settings.count > 1)
    params.push(`count=${settings.count}`);
  const channelIds = settings.channels[streamer];
  if (channelIds?.length > 0)
    channelIds.forEach((id) => params.push(`channels=${id}`));

  return `${base}?${params.join("&")}`;
}

const videoStore = create((set) => ({
  videos: [],
  fetchVideos: async ({ streamer, settings }) => {
    const res = await fetch(buildURL({ streamer, settings }));
    const videos = await res.json();
    set({ videos });
  },

  isVideoLoading: false,
  setIsVideoLoading: (isVideoLoading) => set({ isVideoLoading }),
}));

export default videoStore;
