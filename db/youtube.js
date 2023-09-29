import "dotenv/config";
import { google } from "googleapis";
import { parse, toSeconds } from "iso8601-duration";
import dayjs from "dayjs";

function formatDateForSql(ytDate) {
  return dayjs(ytDate).format("YYYY-MM-DD hh:mm:ss");
}

function loadClient() {
  return google.youtube({ version: "v3", auth: process.env.YOUTUBE_API_KEY });
}

const youtube = loadClient();

const yt = {
  async getChannelDetails({ username, channelId }) {
    const req = {
      part: "contentDetails,snippet,statistics",
    };
    if (channelId) req.id = channelId;
    else if (username) req.forUsername = username;
    else throw "Need username or channelId to get channel details";

    try {
      const res = await youtube.channels.list(req);
      const channel = res?.data?.items?.[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        uploadsPlaylist: channel.contentDetails.relatedPlaylists.uploads,
        viewCount: channel.statistics.viewCount,
      };
    } catch (err) {
      throw err;
    }
  },

  async getVideos(channel, pageToken) {
    try {
      const res = await youtube.playlistItems.list({
        part: "contentDetails",
        playlistId: channel.uploadsPlaylist,
        maxResults: 50,
        pageToken: pageToken || undefined,
      });
      return {
        nextPageToken: res?.data?.nextPageToken,
        items: res?.data?.items?.map(
          ({ contentDetails: { videoId, videoPublishedAt } }) => ({
            videoId,
            videoPublishedAt,
          })
        ),
      };
    } catch (err) {
      throw err;
    }
  },

  async getVideoData(videoIds) {
    try {
      const res = await youtube.videos.list({
        part: "snippet,contentDetails,statistics",
        id: videoIds.join(","),
      });
      return res?.data?.items?.map(
        ({
          id,
          contentDetails: { duration },
          snippet: { title, publishedAt },
          statistics: { viewCount },
        }) => ({
          videoId: id,
          videoTitle: title,
          viewCount,
          duration: toSeconds(parse(duration)),
          publishedAt: formatDateForSql(publishedAt),
        })
      );
    } catch (err) {
      throw err;
    }
  },

  async getChannelVideos(channel, pageToken) {
    const videos = await yt.getVideos(channel, pageToken);
    let videoData = await yt.getVideoData(videos.items.map((v) => v.videoId));
    videoData = videoData.map(({ ...v }) => ({
      ...v,
      channelId: channel.id,
      channelTitle: channel.title,
    }));

    return { videos: videoData, nextPageToken: videos.nextPageToken };
  },
};

export default yt;
