import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import useSettings from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";

export default function Player({ timer, onEnded }) {
  const player = useRef(null);
  const [playerIsReady, setPlayerIsReady] = useState(false);
  const settings = useSettings((state) => state.settings);
  const video = useVideoStore((state) => state.videos[0]);

  const autoplay = settings.autoplay || settings.mode === "endless";

  const setup = useCallback(() => {
    if (!window.YT) return;
    player.current = new window.YT.Player("yt-player", {
      videoId: video?.videoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        start: settings.randomStart ? video?.startSeconds : undefined,
      },
    });
    player.current.addEventListener("onReady", "onPlayerReady");
    player.current.addEventListener("onStateChange", "onPlayerStateChange");
  }, [video, settings.randomStart]);

  const onPlayerReady = useCallback(
    (event) => {
      setPlayerIsReady(true);
    },
    [setPlayerIsReady]
  );

  const onPlayerStateChange = useCallback(
    ({ data: state }) => {
      if (settings.mode !== "endless") return;
      switch (state) {
        case window.YT.PlayerState.ENDED:
          if (timer.isRunning) {
            timer.pause();
            onEnded();
          }
          break;
        case window.YT.PlayerState.PAUSED:
          timer.pause();
          break;
        case window.YT.PlayerState.PLAYING:
          timer.start();
          break;
      }
    },
    [settings.mode, timer, onEnded]
  );

  useEffect(() => {
    window.onPlayerReady = onPlayerReady;
    window.onPlayerStateChange = onPlayerStateChange;
  }, [onPlayerReady, onPlayerStateChange]);

  useEffect(() => {
    if (!player.current) setup();
    if (playerIsReady) {
      const options = {
        videoId: video?.videoId,
        startSeconds: settings.randomStart ? video?.startSeconds : undefined,
      };
      if (autoplay) {
        player.current.loadVideoById(options);
      } else {
        player.current.cueVideoById(options);
      }
    }
  }, [video?.videoId, playerIsReady, setPlayerIsReady, setup]);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      setup();
    };
  }, [setup]);

  return (
    <>
      <Script id="yt-script" src="https://www.youtube.com/iframe_api" />
      <div id="yt-player" style={{ height: "100%", width: "100%" }} />
    </>
  );
}
