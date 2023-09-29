"use client";
import { create } from "zustand";

const videoStore = create((set) => ({
  videos: [],
  fetchVideos: async (streamer) => {
    const res = await fetch(`/random?streamer=${streamer}`);
    const videos = await res.json();
    set({ videos });
  },
}));

export default videoStore;
