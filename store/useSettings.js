"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import merge from "lodash/merge";
import streamers from "@/streamers";

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
    acc[streamer.route] = streamer.channels.map((channel) => channel.username);
    return acc;
  }, {}),
  autoplay: true,
  randomStart: true,
  timer: {
    h: 0,
    m: 0,
    s: 30,
  },
});

const useSettings = create(
  persist(
    (set) => ({
      settings: defaultSettings,

      setSettings: (data) =>
        set((state) => ({
          settings: merge({}, state.settings, data),
        })),

      resetSettings: () => {
        return { settings: defaultSettings };
      },
    }),
    {
      name: SETTINGS_KEY,
    }
  )
);

export default useSettings;
