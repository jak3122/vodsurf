import streamers from "../streamers/index.js";
import Connection from "./Connection.js";

const connections = {};

streamers.forEach((streamer) => {
  connections[streamer.route] = new Connection(streamer.route);
});

export default connections;
