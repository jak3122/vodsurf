import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import streamers from "../streamers/index.js";
import { mask, randByWeight, randInt, randUniform } from "./util.js";
import yt from "./youtube.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export default class Connection {
  constructor(streamerName, db) {
    if (streamerName) {
      this.db = new Database(path.join(dataDir, `${streamerName}.db`));
      this.streamer = streamers.find((s) => s.route === streamerName);
    }
    if (db) {
      this.db = db;
    }
  }

  allChannelIds() {
    return this.streamer.channels.map((c) => c.channelId);
  }

  /* Populate/update */

  async sync({ full = false, limit = null }) {
    if (full) {
      this.dropTables();
    }
    this.createTables();
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
      const rowsAdded = this.updateDatabaseWithVideos(
        filteredVideos,
        channelDetails
      );
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

  updateDatabaseWithVideos(videos, channel) {
    return this.db.transaction((videos, channel) => {
      const added = this.insertVideos(videos);

      return added;
    })(videos, channel);
  }

  /* Database methods */

  createTables() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS videos (
        videoId VARCHAR(14) PRIMARY KEY NOT NULL,
        duration INT NOT NULL,
        publishedAt DATEONLY NOT NULL,
        viewCount INT,
        channelId VARCHAR(30) NOT NULL,
        channelTitle VARCHAR(30),
        videoTitle VARCHAR(100)
      )`
    );
    this.db.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS videoKey ON videos (videoId);
       CREATE INDEX IF NOT EXISTS coverIndex ON videos (channelId, publishedAt);
       CREATE INDEX IF NOT EXISTS publishedKey ON videos (publishedAt);
       CREATE INDEX IF NOT EXISTS durationKey ON videos (duration);
       CREATE INDEX IF NOT EXISTS viewCountKey ON videos (viewCount);
      `
    );
  }

  dropTables() {
    this.db.prepare("DROP TABLE IF EXISTS videos").run();
    this.db.prepare("DROP TABLE IF EXISTS channels").run();
  }

  insertVideos(videos) {
    if (!videos || !videos.length) return null;
    let inserted = 0;
    const stmt = this.db.prepare(
      `INSERT INTO videos
        (duration, publishedAt, videoId, viewCount, channelId, channelTitle, videoTitle)
      VALUES
        ($duration, $publishedAt, $videoId, $viewCount, $channelId, $channelTitle, $videoTitle)
      ON CONFLICT(videoId) 
      DO UPDATE SET
        duration = excluded.duration,
        publishedAt = excluded.publishedAt,
        viewCount = excluded.viewCount,
        channelId = excluded.channelId,
        channelTitle = excluded.channelTitle,
        videoTitle = excluded.videoTitle;
        `
    );
    for (const video of videos) {
      inserted += stmt.run(video).changes;
    }
    return inserted;
  }

  sumDurations(channelIds) {
    const query = this.db
      .prepare(`SELECT SUM(duration) AS sum FROM videos WHERE channelId in ?`)
      .get([[channelIds]]);
    return Number(query?.sum);
  }

  getMostRecent(channelId) {
    const query = this.db
      .prepare(
        `SELECT channelId, MAX(publishedAt) as mostRecent
     FROM videos
     WHERE channelId = ?`
      )
      .get(channelId);
    return query?.mostRecent;
  }

  /* Query methods */

  randomVideos(channelIds, strategy, count, { dateLow, dateHigh }) {
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

    const videos = this.db.transaction(() => {
      const stmt = this.db.prepare(
        `SELECT rowid, ${column}
          FROM videos
          WHERE channelId IN (${mask(channelIds)})
            AND publishedAt BETWEEN $dateLow and $dateHigh
        `
      );
      const queryVideos = stmt.all([...channelIds], {
        dateLow,
        dateHigh: `${dateHigh} 23:59:59`,
      });

      let selectedVideos = key
        ? randByWeight(queryVideos, key, count)
        : randUniform(queryVideos, count);

      const rowids = selectedVideos.map((v) => v.rowid);
      const getStmt = this.db.prepare(
        `SELECT * FROM videos WHERE rowid IN (${mask(rowids)})`
      );
      selectedVideos = getStmt.all([...rowids]);

      return selectedVideos.map((v) => ({
        ...v,
        timestamp: randInt(0, v.duration),
      }));
    })();

    return videos;
  }

  /* Stats */
  getStats() {
    console.time("stats");
    let stats = this.db
      .prepare(
        `SELECT
        channelId,
        channelTitle,
        SUM(viewCount) as views,
        SUM(duration) as duration,
        COUNT() as videos
       FROM videos
       GROUP BY channelId`
      )
      .all();

    console.timeEnd("stats");
    return stats;
  }
}
