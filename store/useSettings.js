"use client";
import streamers from "@/streamers";
import dayjs from "dayjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const playerModes = Object.freeze({
  VIDEO: "video",
  LINKS: "links",
  ENDLESS: "endless",
});

const SETTINGS_KEY = "settings";
const defaultSettings = Object.freeze({
  mode: playerModes.VIDEO,
  count: 3,
  strategy: "by_duration",
  channels: streamers.reduce((acc, streamer) => {
    acc[streamer.route] = streamer.channels.map((c) => c.channelId);
    return acc;
  }, {}),
  autoplay: true,
  randomStart: true,
  timer: {
    h: 0,
    m: 0,
    s: 30,
  },
  dateLow: dayjs("2015-01-01").format("YYYY-MM-DD"),
  dateHigh: dayjs().format("YYYY-MM-DD"),
});

const useSettings = create(
  persist(
    (set) => ({
      settings: defaultSettings,

      setSettings: (data) => set({ settings: data }),

      resetSettings: () => ({ settings: defaultSettings }),
    }),
    {
      name: SETTINGS_KEY,
    }
  )
);

export default useSettings;
