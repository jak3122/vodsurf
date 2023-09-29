import pick from "lodash/pick";
import connections from "../../db/connections.js";
import streamers from "../../streamers/index.js";

export const revalidate = 0;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  let channels = params.get("channels");
  let method = params.get("method");
  let strategy = params.get("strategy");
  let count = params.get("count");

  if (!count) count = 1;
  count = Number(count);
  if (count < 1) count = 1;
  if (count > 10) count = 10;

  console.log(params);
  console.time(`random video: ${strategy}, ${count}`);

  const streamerRoute = streamers.find((s) =>
    s.supportedRoutes.includes(params.get("streamer"))
  )?.route;
  const streamer = connections[streamerRoute];
  console.log("streamer:", params.get("streamer"));
  console.log("streamerRoute:", streamerRoute);

  const videos = streamer.randomVideos(channels, method, count);
  const response = videos.map((video) => pick(video, responseFields));
  console.log(response);

  console.timeEnd(`random video: ${strategy}, ${count}`);

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
