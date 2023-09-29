"use client";
import { create } from "zustand";

const videoStore = create((set) => ({
  videos: [],
  fetchVideos: async (streamer) => {
    const res = await fetch(`/random?streamer=${streamer}`);
    const { data } = await res.json();
    set({ videos: data });
  },
}));

export default videoStore;
