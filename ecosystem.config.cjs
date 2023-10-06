module.exports = {
  apps: [
    {
      name: "vodsurf",
      script: "npm run start",
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
    {
      name: "update-script-full",
      script: "./db/sync.js",
      args: "--full",
      cron_restart: "0 0 * * *", // every day
      exec_mode: "fork",
      autorestart: false,
    },
  ],
};
