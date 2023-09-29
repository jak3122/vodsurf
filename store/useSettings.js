"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import _ from "lodash";
import streamers from "@/streamers";

export const playerModes = Object.freeze({
  NONE: "none",
  VIDEO: "video",
  LINKS: "links",
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

const getStoredSettings = () => {
  const settingsFromStorage = localStorage?.getItem(SETTINGS_KEY);
  return settingsFromStorage
    ? _.merge({}, defaultSettings, JSON.parse(settingsFromStorage))
    : defaultSettings;
};

const setStoredSettings = (settings) => {
  localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const useSettings = create(
  persist(
    (set) => ({
      settings: defaultSettings,

      setSettings: (data) =>
        set((state) => ({
          settings: _.merge({}, state.settings, data),
        })),

      // saveSettings: () => {
      //   set((state) => {
      //     setStoredSettings(state.settings);
      //     return state;
      //   });
      // },

      resetSettings: () => {
        // setStoredSettings(defaultSettings);
        return { settings: defaultSettings };
      },
    }),
    {
      name: SETTINGS_KEY,
    }
  )
);

export default useSettings;
