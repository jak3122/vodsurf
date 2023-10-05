module.exports = {
  apps: [
    {
      name: "vodsurf",
      script: "pnpm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "update-script",
      script: "./db/sync.js",
      cron_restart: "0 * * * *", // every hour
      exec_mode: "fork",
      autorestart: false,
    },
  ],
};
