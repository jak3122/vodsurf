import Connection from "./Connection.js";

const connection = new Connection("vine");

const strats = ["greatest_hits", "by_video", "by_duration", "hidden_gems"];
const channelIds = ["UC2_IYqb1Tc_8Azh7rByedPA"];
let dateRange = {
  dateLow: "2015-01-01",
  dateHigh: "2024-07-18",
};

const itersWarmup = 1000;
const iters = 20000;

// warmup
for (let i = 0; i < itersWarmup; i++) {
  for (const strat of strats) {
    const videos = connection.randomVideos(channelIds, strat, 5, dateRange);
  }
}

console.log(`\ndate range: ${dateRange.dateLow} - ${dateRange.dateHigh}`);
for (const strat of strats) {
  console.time(strat);
  for (let i = 0; i < iters; i++) {
    const videos = connection.randomVideos(channelIds, strat, 5, dateRange);
  }
  console.timeEnd(strat);
}

dateRange = {
  dateLow: "2017-09-01",
  dateHigh: "2017-10-01",
};
console.log(`\ndate range: ${dateRange.dateLow} - ${dateRange.dateHigh}`);
for (const strat of strats) {
  console.time(strat);
  for (let i = 0; i < iters; i++) {
    const videos = connection.randomVideos(channelIds, strat, 5, dateRange);
  }
  console.timeEnd(strat);
}
