module.exports = {
    apps: [
        {
            name: "Backend",
            script: "dist/main.js",
            time: true,
            instances: 1,
            autorestart: true,
            max_restarts: 50,
            watch: false,
            max_memory_restart: "1G",
            namespace: "drifterhighway",
        },
    ],
    deploy: {
        production: {
            // user: "github",
            // host: "ibns.tech",
            // key: "deploy.key",
            ref: "origin/main",
            repo: "https://github.com/drifterhighway-space/drifterhighway.space-backend.git",
            path: "/var/drifterhighway.space/backend/",
            "post-deploy":
                "npm i && tsc -b && pm2 reload ecosystem.config.js --env production --force && pm2 save",
            env: {
                NODE_ENV: "production",
            },
        },
    },
};
