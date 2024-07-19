import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import streamers from "../streamers/index.js";
import { attachReverseWeights, mask, randByWeight, randInt } from "./util.js";
import yt from "./youtube.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export default class Connection {
  constructor(streamerName) {
    this.db = new Database(path.join(dataDir, `${streamerName}.db`));
    this.streamer = streamers.find((s) => s.route === streamerName);
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

      if (added) {
        this.computeCumulativeColumn(channel.id, "duration");
        this.computeCumulativeColumn(channel.id, "viewCount");
        this.computeCumulativeReverseColumn(channel.id, "duration");
        this.computeCumulativeReverseColumn(channel.id, "viewCount");
        this.createChannelRow(channel);
      }

      return added;
    })(videos, channel);
  }

  /* Database methods */

  createTables() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS videos (
        videoId VARCHAR(14) PRIMARY KEY NOT NULL,
        duration INT NOT NULL,
        durationCumul INT,
        durationCumulRev INT,
        publishedAt DATEONLY NOT NULL,
        viewCount INT,
        viewCountCumul INT,
        viewCountCumulRev INT,
        channelId VARCHAR(30) NOT NULL,
        channelTitle VARCHAR(30),
        videoTitle VARCHAR(100),
        randomValue REAL
      )`
    );
    this.db.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS videoKey ON videos (videoId);
       CREATE INDEX IF NOT EXISTS channelKey1 ON videos (channelId, durationCumul);
       CREATE INDEX IF NOT EXISTS channelKey2 ON videos (channelId, viewCountCumul);
       CREATE INDEX IF NOT EXISTS channelKey3 ON videos (channelId, viewCountCumulRev);
       CREATE INDEX IF NOT EXISTS coverIndex ON videos (channelId, randomValue, publishedAt);
       CREATE INDEX IF NOT EXISTS publishedKey ON videos (publishedAt);
       CREATE INDEX IF NOT EXISTS durationKey ON videos (duration);
       CREATE INDEX IF NOT EXISTS durationCumulKey ON videos (durationCumul, channelId);
       CREATE INDEX IF NOT EXISTS viewCountKey ON videos (viewCount);
       CREATE INDEX IF NOT EXISTS viewCountCumulKey ON videos (viewCountCumul, channelId);
       CREATE INDEX IF NOT EXISTS viewCountCumulRevKey ON videos (viewCountCumulRev, channelId);
       CREATE INDEX IF NOT EXISTS randomKey ON videos (randomValue);
      `
    );
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS channels (
        channelId VARCHAR(30) PRIMARY KEY NOT NULL,
        duration INT,
        viewCount INT,
        videoCount INT,
        channelTitle VARCHAR(30)
      )`
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
        (duration, publishedAt, videoId, viewCount, channelId, channelTitle, videoTitle, randomValue)
      VALUES
        ($duration, $publishedAt, $videoId, $viewCount, $channelId, $channelTitle, $videoTitle, RANDOM())
      ON CONFLICT(videoId) 
      DO UPDATE SET
        duration = excluded.duration,
        publishedAt = excluded.publishedAt,
        viewCount = excluded.viewCount,
        channelId = excluded.channelId,
        channelTitle = excluded.channelTitle,
        videoTitle = excluded.videoTitle,
        randomValue = RANDOM();
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

  computeCumulativeColumn(channelId, column) {
    const columnCumul = `${column}Cumul`;
    const query = this.db
      .prepare(
        `WITH cumul_table AS
        (
          SELECT
            videoId, channelId, ${column},
            SUM(col) OVER (ORDER BY ${column}) as ${columnCumul}
          FROM
          (
            SELECT
              videoId, channelId, ${column},
              LAG(${column}, 1, 0) OVER (ORDER BY ${column}) col
            FROM videos
            WHERE channelId = $channelId ORDER BY ${column} ASC
          )
        AS t1
        )
      UPDATE videos
      SET ${columnCumul} = (SELECT ${columnCumul} FROM cumul_table WHERE videoId = videos.videoId)
      WHERE channelId = $channelId
      `
      )
      .run({ channelId });
    return query;
  }

  computeCumulativeReverseColumn(channelId, column) {
    const columnCumul = `${column}Cumul`;
    const columnCumulRev = `${column}CumulRev`;
    const rows = this.db
      .prepare(
        `SELECT
          rowid, ${columnCumul}
        FROM videos
        WHERE channelId = $channelId
        ORDER BY ${columnCumul}`
      )
      .all({ channelId });

    const copy = rows.map((r) => ({ ...r }));
    copy.reverse();

    const stmt = this.db.prepare(
      `UPDATE videos
         SET ${columnCumulRev} = $${columnCumulRev} WHERE rowid = $rowid`
    );

    for (let i = 0; i < rows.length; i++) {
      const update = {
        ...rows[i],
        [columnCumulRev]: copy[i][columnCumul],
      };
      stmt.run(update);
    }
  }

  createChannelRow({ id: channelId, title: channelTitle }) {
    this.db
      .prepare(
        `REPLACE INTO channels (channelId, duration, viewCount, videoCount, channelTitle)
        SELECT
          videos.channelId,
          SUM(videos.duration) as durSum,
          SUM(videos.viewCount) as viewSum,
          COUNT() as videoCount,
          $channelTitle as channelTitle
        FROM videos
        WHERE videos.channelId = $channelId
    `
      )
      .run({ channelId, channelTitle });
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

  getVideoRow(videoId) {
    const videoQuery = this.db
      .prepare(
        `SELECT duration, durationCumul, videoId, publishedAt,
            viewCount, channelId, channelTitle, videoTitle
    FROM videos
    WHERE videoId = ?`
      )
      .get(videoId);
    const video = videoQuery;
    return video;
  }

  getVideoRowByRowId(rowid) {
    const video = this.db
      .prepare(
        `SELECT duration, durationCumul, videoId, publishedAt,
    viewCount, channelId, channelTitle, videoTitle
    FROM videos
    WHERE rowid = ?`
      )
      .get(rowid);
    return video;
  }

  /* Query methods */

  randomVideos(channelIds, strategy, count, dateRange) {
    if (!channelIds) channelIds = this.allChannelIds();
    if (!Array.isArray(channelIds)) channelIds = [channelIds];

    let videos;
    switch (strategy) {
      case "by_video":
        videos = this.byVideoCount(channelIds, count, dateRange);
        break;
      case "greatest_hits":
        videos = this.greatestHits(channelIds, count, dateRange);
        break;
      case "hidden_gems":
        videos = this.hiddenGems(channelIds, count, dateRange);
        break;
      case "by_duration":
      default:
        videos = this.byDuration(channelIds, count, dateRange);
        break;
    }

    return videos;
  }

  byDuration(channelIds, count, { dateLow, dateHigh }) {
    const trans = this.db.transaction((count) => {
      const channels = this.db
        .prepare(
          `SELECT channelId, duration
          FROM channels
          WHERE channelId in (${mask(channelIds)})`
        )
        .all(channelIds);

      const fetchedVideosSet = new Set();
      const videos = [];

      for (let i = 0; i < count; i++) {
        const retries = 5;

        for (let retry = 0; retry < retries; retry++) {
          const randChannel = randByWeight(channels, "duration");
          const { channelId, duration } = randChannel;

          const randValue = randInt(0, duration);
          const seenIds = fetchedVideosSet.size
            ? `AND rowid NOT IN (${[...fetchedVideosSet].join(", ")})`
            : "";
          const selectVideoQuery = this.db
            .prepare(
              `SELECT rowid
                FROM videos
                WHERE
                  channelId = $channelId
                  AND $randValue > durationCumul
                  AND publishedAt >= $dateLow
                  AND publishedAt <= $dateHigh
                  ${seenIds}
                ORDER BY durationCumul DESC
                LIMIT 1
              `
            )
            .get({
              channelId,
              randValue,
              dateLow,
              dateHigh: `${dateHigh} 23:59:59`,
            });
          if (!selectVideoQuery) break;

          const { rowid } = selectVideoQuery;

          if (!fetchedVideosSet.has(rowid)) {
            fetchedVideosSet.add(rowid);
            const video = this.getVideoRowByRowId(rowid);
            videos.push({
              ...video,
              startSeconds: randInt(0, video.duration),
            });
          }

          if (videos.length >= count) break;
        }
      }

      return videos;
    });

    return trans(count);
  }

  byVideoCount(channelIds, count, { dateLow, dateHigh }) {
    const trans = this.db.transaction((count) => {
      const channels = this.db
        .prepare(
          `SELECT channelId, videoCount
          FROM channels
          WHERE channelId in (${mask(channelIds)})`
        )
        .all(channelIds);

      const fetchedVideosSet = new Set();
      const videos = [];

      for (let i = 0; i < count; i++) {
        const retries = 5;

        for (let retry = 0; retry < retries; retry++) {
          const randChannel = randByWeight(channels, "videoCount");
          const { channelId } = randChannel;

          const seenIds = fetchedVideosSet.size
            ? `AND rowid NOT IN (${[...fetchedVideosSet].join(", ")})`
            : "";
          const selectVideosQuery = this.db
            .prepare(
              `SELECT rowid
                FROM videos
                WHERE
                  channelId = $channelId
                  AND randomValue >= (SELECT(RANDOM()))
                  AND publishedAt >= $dateLow
                  AND publishedAt <= $dateHigh
                  ${seenIds}
                ORDER BY randomValue
                LIMIT 1;
              `
            )
            .get({
              channelId,
              dateLow,
              dateHigh: `${dateHigh} 23:59:59`,
            });
          if (!selectVideosQuery) break;

          const { rowid } = selectVideosQuery;

          if (!fetchedVideosSet.has(rowid)) {
            fetchedVideosSet.add(rowid);
            const video = this.getVideoRowByRowId(rowid);
            videos.push({
              startSeconds: randInt(0, video.duration),
              ...video,
            });
          }

          if (videos.length >= count) break;
        }
      }

      return videos;
    });

    return trans(count);
  }

  greatestHits(channelIds, count, { dateLow, dateHigh }) {
    const trans = this.db.transaction((count) => {
      const channels = this.db
        .prepare(
          `SELECT channelId, viewCount
          FROM channels
          WHERE channelId in (${mask(channelIds)})`
        )
        .all(channelIds);

      const fetchedVideosSet = new Set();
      const videos = [];

      for (let i = 0; i < count; i++) {
        const retries = 5;

        for (let retry = 0; retry < retries; retry++) {
          const randChannel = randByWeight(channels, "viewCount");
          const { channelId, viewCount } = randChannel;

          const randValue = randInt(0, viewCount);
          const seenIds = fetchedVideosSet.size
            ? `AND rowid NOT IN (${[...fetchedVideosSet].join(", ")})`
            : "";
          const selectVideoQuery = this.db
            .prepare(
              `SELECT rowid, viewCountCumul
                FROM videos
                WHERE
                  channelId = $channelId
                  AND $randValue >= viewCountCumul
                  AND publishedAt >= $dateLow
                  AND publishedAt <= $dateHigh
                  ${seenIds}
                ORDER BY viewCountCumul DESC
                LIMIT 1
              `
            )
            .get({
              channelId,
              randValue,
              dateLow,
              dateHigh: `${dateHigh} 23:59:59`,
            });
          if (!selectVideoQuery) break;

          const { rowid } = selectVideoQuery;

          if (!fetchedVideosSet.has(rowid)) {
            fetchedVideosSet.add(rowid);
            const video = this.getVideoRowByRowId(rowid);
            videos.push({
              startSeconds: randInt(0, video.duration),
              ...video,
            });
          }

          if (videos.length >= count) break;
        }
      }

      return videos;
    });

    return trans(count);
  }

  hiddenGems(channelIds, count, { dateLow, dateHigh }) {
    const trans = this.db.transaction((count) => {
      let channels = this.db
        .prepare(
          `SELECT channelId, viewCount
          FROM channels
          WHERE channelId in (${mask(channelIds)})`
        )
        .all(channelIds);
      channels = attachReverseWeights(channels, "viewCount", "viewCountRev");

      const fetchedVideosSet = new Set();
      const videos = [];

      for (let i = 0; i < count; i++) {
        const retries = 5;

        for (let retry = 0; retry < retries; retry++) {
          const randChannel = randByWeight(channels, "viewCountRev");
          const { channelId } = randChannel;

          const maxCumulQuery = this.db
            .prepare(
              `SELECT MAX(viewCountCumulRev) as maxCumul
          FROM videos
          WHERE channelId = ?`
            )
            .get(channelId);
          const { maxCumul } = maxCumulQuery;

          const randValue = randInt(0, maxCumul);
          const seenIds = fetchedVideosSet.size
            ? `AND rowid NOT IN (${[...fetchedVideosSet].join(", ")})`
            : "";
          const selectVideoQuery = this.db
            .prepare(
              `SELECT rowid
                FROM videos
                WHERE
                  channelId = $channelId
                  AND $randValue > viewCountCumulRev
                  AND publishedAt >= $dateLow
                  AND publishedAt <= $dateHigh
                  ${seenIds}
                ORDER BY viewCountCumulRev DESC
                LIMIT 1
          `
            )
            .get({
              channelId,
              randValue,
              dateLow,
              dateHigh: `${dateHigh} 23:59:59`,
            });
          if (!selectVideoQuery) break;

          const { rowid } = selectVideoQuery;

          if (!fetchedVideosSet.has(rowid)) {
            fetchedVideosSet.add(rowid);
            const video = this.getVideoRowByRowId(rowid);
            videos.push({
              ...video,
              startSeconds: randInt(0, video.duration),
            });
          }

          if (videos.length >= count) break;
        }
      }

      return videos;
    });

    return trans(count);
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
