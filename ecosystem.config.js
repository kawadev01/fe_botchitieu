module.exports = {
    apps: [
      {
        name: "admin-boutique-2",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3651",
        watch: false,
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  