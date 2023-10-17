"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const videoStore = create(
  persist(
    (set) => ({
      videos: [],
      history: [],

      fetchVideos: async ({ streamer, settings }) => {
        const res = await fetch(buildURL({ streamer, settings }));
        const videos = await res.json();
        set((state) => {
          const h = state.history?.length ? state.history : [];
          const history = [...h, ...videos].slice(-50);
          return { history, videos };
        });
      },

      isVideoLoading: false,
      setIsVideoLoading: (isVideoLoading) => set({ isVideoLoading }),

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: "history",
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);

export default videoStore;
