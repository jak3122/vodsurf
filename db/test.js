import assert from "assert";
import Connection from "./Connection.js";
import { uniqueByKey } from "./util.js";

async function createTestVideos(
  connection,
  num = 10_000,
  strategy = "by_duration",
  count = 1,
  dateLow = "1970-01-01",
  dateHigh = "2024-01-01",
  channels = null
) {
  const results = [];
  for (let i = 0; i < num; i++) {
    const videos = await connection.randomVideos(channels, strategy, count, {
      dateLow,
      dateHigh,
    });
    results.push(...videos);
  }
  return results;
}

function testProportions(
  counts,
  uniqueResults,
  expectedProportions,
  num = 10_000
) {
  Object.keys(counts).forEach((videoId) => {
    const actualProportion = counts[videoId] / num;
    const expectedProportion = expectedProportions[videoId];
    assert(
      Math.abs(actualProportion - expectedProportion) < 0.01,
      `Distribution should be close to ${expectedProportion}, but was ${actualProportion}: ${JSON.stringify(
        uniqueResults.find((r) => r.videoId === videoId)
      )}`
    );
  });
}

describe("randomVideos", function () {
  let connection;
  let channels;
  let num = 10_000;
  this.timeout(0);

  before(async () => {
    connection = new Connection("jerma");
    await connection.createTables();
    channels = null;
  });

  it("should return a valid video and timestamp", async () => {
    const [result] = await connection.randomVideos(channels, "by_duration", 1, {
      dateLow: "2023-01-01",
      dateHigh: "2023-02-31",
    });
    assert(
      result.videoId && typeof result.videoId === "string",
      "Should return a videoId"
    );
    assert(
      typeof result.timestamp === "number",
      "Should return a numeric timestamp"
    );
    assert(result.timestamp >= 0, "Timestamp should be non-negative");
  });

  it("should distribute selections uniformly for by_video", async () => {
    const results = await createTestVideos(connection, num, "by_video");
    const uniqueResults = uniqueByKey(results, "videoId");

    const counts = results.reduce((acc, r) => {
      acc[r.videoId] = (acc[r.videoId] || 0) + 1;
      return acc;
    }, {});

    const expectedProportions = uniqueResults.reduce((acc, r) => {
      acc[r.videoId] = 1.0 / num;
      return acc;
    }, {});

    testProportions(counts, uniqueResults, expectedProportions);
  });

  it("should distribute selections proportionally to video duration for by_duration", async () => {
    const results = await createTestVideos(connection);
    const uniqueResults = uniqueByKey(results, "videoId");

    const counts = results.reduce((acc, r) => {
      acc[r.videoId] = (acc[r.videoId] || 0) + 1;
      return acc;
    }, {});

    const totalDuration = uniqueResults.reduce((sum, r) => sum + r.duration, 0);
    const expectedProportions = uniqueResults.reduce((acc, r) => {
      acc[r.videoId] = r.duration / totalDuration;
      return acc;
    }, {});

    testProportions(counts, uniqueResults, expectedProportions);
  });

  it("should distribute selections proportionally to view count for greatest_hits", async () => {
    const results = await createTestVideos(connection, num, "greatest_hits");
    const uniqueResults = uniqueByKey(results, "videoId");

    const counts = results.reduce((acc, r) => {
      acc[r.videoId] = (acc[r.videoId] || 0) + 1;
      return acc;
    }, {});

    const totalViews = uniqueResults.reduce((sum, r) => sum + r.viewCount, 0);
    const expectedProportions = uniqueResults.reduce((acc, r) => {
      acc[r.videoId] = r.viewCount / totalViews;
      return acc;
    }, {});

    testProportions(counts, uniqueResults, expectedProportions);
  });

  it("should distribute selections proportionally to inverse view count for hidden_gems", async () => {
    const results = await createTestVideos(connection, num, "hidden_gems");
    const uniqueResults = uniqueByKey(results, "videoId");

    const counts = results.reduce((acc, r) => {
      acc[r.videoId] = (acc[r.videoId] || 0) + 1;
      return acc;
    }, {});

    const totalViews = uniqueResults.reduce((sum, r) => sum + r.viewCount, 0);
    const expectedProportions = uniqueResults.reduce((acc, r) => {
      acc[r.videoId] = 1.0 / r.viewCount / totalViews;
      return acc;
    }, {});

    testProportions(counts, uniqueResults, expectedProportions);
  });
});
