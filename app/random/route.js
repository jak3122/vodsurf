import pick from "lodash/pick";
import connections from "../../db/connections.js";
import streamers from "../../streamers/index.js";

export const revalidate = 0;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  let channels = params.getAll("channels");
  let strategy = params.get("strategy") || "by_duration";
  let count = params.get("count");
  let dateLow = params.get("dateLow");
  let dateHigh = params.get("dateHigh");

  const streamerConfig = streamers.find((s) =>
    s.supportedRoutes.includes(params.get("streamer"))
  );

  if (!streamerConfig) {
    const errMessage = `'streamer' is required. Supported streamers: ${streamers
      .map((s) => s.route)
      .join(", ")}`;
    return Response.json({ error: errMessage }, { status: 400 });
  }

  if (!channels || channels?.length === 0) {
    channels = streamerConfig?.channels.map((c) => c.channelId);
  }
  channels = [...new Set(channels)];
  channels = channels.filter((channel) =>
    streamerConfig.channels.some((c) => c.channelId === channel)
  );

  if (!count) count = 1;
  count = Number(count);
  if (count < 1) count = 1;
  if (count > 10) count = 10;

  const timerLabel = `[${dateLow} - ${dateHigh}] ${strategy}, ${count}`;

  console.log();
  console.time(timerLabel);

  const streamerRoute = streamerConfig?.route;
  const streamer = connections[streamerRoute];

  const videos = streamer.randomVideos(channels, strategy, count, {
    dateLow,
    dateHigh,
  });
  const response = videos.map((video) => pick(video, responseFields));

  console.timeEnd(timerLabel);

  return Response.json(response);
}

const responseFields = [
  "channelId",
  "channelTitle",
  "duration",
  "publishedAt",
  "startSeconds",
  "videoId",
  "videoTitle",
  "viewCount",
];
