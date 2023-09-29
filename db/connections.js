import streamers from "@/streamers";
import Connection from "@/db/Connection";

const connections = {};

streamers.forEach((streamer) => {
  connections[streamer.route] = new Connection(streamer.route);
});

export default connections;
