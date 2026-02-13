import streamers from "../streamers/index.js";
import { createDbClient } from "./client.js";
import { mask, randByWeight, randInt, randUniform } from "./util.js";
import yt from "./youtube.js";

export default class Connection {
  constructor(streamerName, { readonly = true, fileMustExist = true } = {}) {
    this.db = createDbClient({ readonly, fileMustExist });
    this.streamerName = streamerName;
    this.streamer = streamers.find((s) => s.route === streamerName);
  }

  allChannelIds() {
    return this.streamer.channels.map((c) => c.channelId);
  }

  /* Populate/update */

  async sync({ full = false, limit = null }) {
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
    const mostRecentinDatabase = this.getMostRecent(channelDetails.id);
    console.log(
      `processing ${username}... (most recent: ${new Date(
        mostRecentinDatabase,
      )})`,
    );

    let pageToken = null;
    let addedVideos = 0;

    while (true) {
      const { videos, nextPageToken } = await yt.getChannelVideos(
        channelDetails,
        pageToken,
      );

      // Filter out videos based on viewCount and title
      const filteredVideos = videos
        .filter(({ viewCount }) => !!Number(viewCount))
        .filter(({ videoTitle }) => videoTitleFilter(videoTitle));

      // Update database with the filtered videos and get number of rows added
      const rowsAdded = this.updateDatabaseWithVideos(filteredVideos);
      addedVideos += rowsAdded;

      pageToken = nextPageToken;

      // Stop criteria
      if (
        (limit && addedVideos >= limit) ||
        (!full &&
          new Date(videos?.[videos.length - 1]?.publishedAt) <
            new Date(mostRecentinDatabase)) ||
        videos.length < 50 ||
        !pageToken
      ) {
        console.log(` (${addedVideos} new videos)`);
        break;
      }
    }
  }

  closeDb() {
    this.db.close();
  }

  updateDatabaseWithVideos(videos) {
    return this.db.transaction((videos) => {
      return this.insertVideos(videos);
    })(videos);
  }

  /* Database methods */

  createTables() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS videos (
        videoId VARCHAR(14) PRIMARY KEY NOT NULL,
        streamer VARCHAR(20) NOT NULL,
        duration INT NOT NULL,
        publishedAt DATEONLY NOT NULL,
        viewCount INT,
        channelId VARCHAR(30) NOT NULL,
        channelTitle VARCHAR(30),
        videoTitle VARCHAR(100)
      )`,
    );
    this.db.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS videoKey ON videos (videoId);
       CREATE INDEX IF NOT EXISTS streamerKey ON videos (streamer);
       CREATE INDEX IF NOT EXISTS coverIndex ON videos (streamer, channelId, publishedAt);
       CREATE INDEX IF NOT EXISTS publishedKey ON videos (publishedAt);
       CREATE INDEX IF NOT EXISTS durationKey ON videos (duration);
       CREATE INDEX IF NOT EXISTS viewCountKey ON videos (viewCount);
      `,
    );
  }

  dropTables() {
    this.db.prepare("DROP TABLE IF EXISTS videos").run();
    this.db.prepare("DROP TABLE IF EXISTS channels").run();
  }

  insertVideos(videos) {
    if (!videos || !videos.length) return 0;
    let inserted = 0;
    const stmt = this.db.prepare(
      `INSERT INTO videos
        (streamer, duration, publishedAt, videoId, viewCount, channelId, channelTitle, videoTitle)
      VALUES
        ($streamer, $duration, $publishedAt, $videoId, $viewCount, $channelId, $channelTitle, $videoTitle)
      ON CONFLICT(videoId)
      DO UPDATE SET
        streamer = excluded.streamer,
        duration = excluded.duration,
        publishedAt = excluded.publishedAt,
        viewCount = excluded.viewCount,
        channelId = excluded.channelId,
        channelTitle = excluded.channelTitle,
        videoTitle = excluded.videoTitle;
        `,
    );
    for (const video of videos) {
      inserted += stmt.run({ ...video, streamer: this.streamerName }).changes;
    }
    return inserted;
  }

  sumDurations(channelIds) {
    const query = this.db
      .prepare(
        `SELECT SUM(duration) AS sum FROM videos WHERE streamer = ? AND channelId IN (${mask(
          channelIds,
        )})`,
      )
      .get(this.streamerName, ...channelIds);
    return Number(query?.sum);
  }

  getMostRecent(channelId) {
    const query = this.db
      .prepare(
        `SELECT channelId, MAX(publishedAt) as mostRecent
     FROM videos
     WHERE streamer = ? AND channelId = ?`,
      )
      .get(this.streamerName, channelId);
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
        `SELECT rowid, ${column ? column : "1 as weight"}
          FROM videos
          WHERE streamer = ? AND channelId IN (${mask(channelIds)})
            AND publishedAt BETWEEN $dateLow and $dateHigh
        `,
      );
      const queryVideos = stmt.all(this.streamerName, ...channelIds, {
        dateLow,
        dateHigh: `${dateHigh} 23:59:59`,
      });

      let selectedVideos = key
        ? randByWeight(queryVideos, key, count)
        : randUniform(queryVideos, count);

      if (selectedVideos.length === 0) {
        return [];
      }

      const rowids = selectedVideos.map((v) => v.rowid);
      const getStmt = this.db.prepare(
        `SELECT * FROM videos WHERE rowid IN (${mask(rowids)})`,
      );
      selectedVideos = getStmt.all(...rowids);

      return selectedVideos.map((v) => ({
        ...v,
        timestamp: randInt(0, v.duration),
      }));
    })();

    return videos;
  }

  /* Stats */
  getStats() {
    const stats = this.db
      .prepare(
        `SELECT
        channelId,
        channelTitle,
        SUM(viewCount) as views,
        SUM(duration) as duration,
        COUNT() as videos
       FROM videos
       WHERE streamer = ?
       GROUP BY channelId`,
      )
      .all(this.streamerName);

    return stats;
  }
}
