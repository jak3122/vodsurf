import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createDbClient } from "./client.js";
import streamers from "../streamers/index.js";
import { randByWeight, randInt, randUniform } from "./util.js";
import yt from "./youtube.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export default class Connection {
  constructor(streamerName) {
    this.db = createDbClient();
    this.streamerName = streamerName;
    this.streamer = streamers.find((s) => s.route === streamerName);
  }

  allChannelIds() {
    return this.streamer.channels.map((c) => c.channelId);
  }

  /* Populate/update */

  async sync({ full = false, limit = null }) {
    await this.createTables();
    for (const channel of this.streamer.channels) {
      await this.syncChannel({ channel, full, limit });
    }
  }

  async syncChannel({
    channel: { username, channelId, videoTitleFilter = () => true },
    full,
    limit,
  }) {
    const channelDetails = await yt.getChannelDetails({ username, channelId });
    const mostRecentinDatabase = await this.getMostRecent(channelDetails.id);
    console.log(
      `processing ${username}... (most recent: ${new Date(
        mostRecentinDatabase
      )})`
    );

    let pageToken = null;
    let addedVideos = 0;

    while (true) {
      const { videos, nextPageToken } = await yt.getChannelVideos(
        channelDetails,
        pageToken
      );

      // Filter out videos based on viewCount and title
      const filteredVideos = videos
        .filter(({ viewCount }) => !!Number(viewCount))
        .filter(({ videoTitle }) => videoTitleFilter(videoTitle));

      // Update database with the filtered videos and get number of rows added
      const rowsAdded = await this.updateDatabaseWithVideos(filteredVideos);
      addedVideos += rowsAdded;

      pageToken = nextPageToken;

      // Stop criteria
      if (
        (limit && addedVideos >= limit) ||
        (!full &&
          new Date(videos?.[videos.length - 1]?.publishedAt) <
            new Date(mostRecentinDatabase)) ||
        videos.length < 50
      ) {
        console.log(` (${addedVideos} new videos)`);
        break;
      }
    }
  }

  async updateDatabaseWithVideos(videos) {
    return await this.insertVideos(videos);
  }

  /* Database methods */

  async createTables() {
    await this.db.execute(
      `CREATE TABLE IF NOT EXISTS videos (
        videoId VARCHAR(14) PRIMARY KEY NOT NULL,
        streamer VARCHAR(20) NOT NULL,
        duration INT NOT NULL,
        publishedAt DATEONLY NOT NULL,
        viewCount INT,
        channelId VARCHAR(30) NOT NULL,
        channelTitle VARCHAR(30),
        videoTitle VARCHAR(100)
      )`
    );
    await this.db.execute(
      `CREATE UNIQUE INDEX IF NOT EXISTS videoKey ON videos (videoId)`
    );
    await this.db.execute(
      `CREATE INDEX IF NOT EXISTS streamerKey ON videos (streamer)`
    );
    await this.db.execute(
      `CREATE INDEX IF NOT EXISTS coverIndex ON videos (streamer, channelId, publishedAt)`
    );
    await this.db.execute(
      `CREATE INDEX IF NOT EXISTS publishedKey ON videos (publishedAt)`
    );
    await this.db.execute(
      `CREATE INDEX IF NOT EXISTS durationKey ON videos (duration)`
    );
    await this.db.execute(
      `CREATE INDEX IF NOT EXISTS viewCountKey ON videos (viewCount)`
    );
  }

  async insertVideos(videos) {
    if (!videos || !videos.length) return 0;

    const statements = videos.map((video) => ({
      sql: `INSERT INTO videos
        (streamer, duration, publishedAt, videoId, viewCount, channelId, channelTitle, videoTitle)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(videoId)
      DO UPDATE SET
        streamer = excluded.streamer,
        duration = excluded.duration,
        publishedAt = excluded.publishedAt,
        viewCount = excluded.viewCount,
        channelId = excluded.channelId,
        channelTitle = excluded.channelTitle,
        videoTitle = excluded.videoTitle`,
      args: [
        this.streamerName,
        video.duration,
        video.publishedAt,
        video.videoId,
        video.viewCount,
        video.channelId,
        video.channelTitle,
        video.videoTitle,
      ],
    }));

    const results = await this.db.batch(statements, "write");
    return results.reduce((sum, r) => sum + r.rowsAffected, 0);
  }

  async sumDurations(channelIds) {
    const placeholders = channelIds.map(() => "?").join(",");
    const result = await this.db.execute({
      sql: `SELECT SUM(duration) AS sum FROM videos WHERE streamer = ? AND channelId IN (${placeholders})`,
      args: [this.streamerName, ...channelIds],
    });
    return Number(result.rows[0]?.sum);
  }

  async getMostRecent(channelId) {
    const result = await this.db.execute({
      sql: `SELECT channelId, MAX(publishedAt) as mostRecent
     FROM videos
     WHERE streamer = ? AND channelId = ?`,
      args: [this.streamerName, channelId],
    });
    return result.rows[0]?.mostRecent;
  }

  /* Query methods */

  async randomVideos(channelIds, strategy, count, { dateLow, dateHigh }) {
    if (!channelIds) channelIds = this.allChannelIds();
    if (!Array.isArray(channelIds)) channelIds = [channelIds];

    let column = null;
    let key = null;
    switch (strategy) {
      case "by_duration":
        column = key = "duration";
        break;
      case "greatest_hits":
        column = key = "viewCount";
        break;
      case "hidden_gems":
        column = "1.0 / viewCount AS viewCountInverse";
        key = "viewCountInverse";
        break;
      case "by_video":
      default:
        break;
    }

    // First query: get candidates
    const placeholders = channelIds.map(() => "?").join(",");
    const candidatesResult = await this.db.execute({
      sql: `SELECT rowid, ${column ? column : "1 as weight"}
        FROM videos
        WHERE streamer = ? AND channelId IN (${placeholders})
          AND publishedAt BETWEEN ? AND ?`,
      args: [this.streamerName, ...channelIds, dateLow, `${dateHigh} 23:59:59`],
    });

    const queryVideos = candidatesResult.rows;

    let selectedVideos = key
      ? randByWeight(queryVideos, key, count)
      : randUniform(queryVideos, count);

    if (selectedVideos.length === 0) {
      return [];
    }

    const rowids = selectedVideos.map((v) => v.rowid);
    const rowPlaceholders = rowids.map(() => "?").join(",");
    const fullVideosResult = await this.db.execute({
      sql: `SELECT * FROM videos WHERE rowid IN (${rowPlaceholders})`,
      args: [...rowids],
    });

    // Convert Row objects to plain objects and add timestamp
    return fullVideosResult.rows.map((v) => ({
      ...v,
      timestamp: randInt(0, v.duration),
    }));
  }

  /* Stats */
  async getStats() {
    const result = await this.db.execute({
      sql: `SELECT
        channelId,
        channelTitle,
        SUM(viewCount) as views,
        SUM(duration) as duration,
        COUNT() as videos
       FROM videos
       WHERE streamer = ?
       GROUP BY channelId`,
      args: [this.streamerName],
    });
    // Convert Row objects to plain objects for React serialization
    return result.rows.map((row) => ({ ...row }));
  }
}
