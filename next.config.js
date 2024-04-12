/** @type {import('next').NextConfig} */
// import cron from "node-cron"

// cron.schedule('* * * * *', function() {
//   console.log('running a task every minute');
// });

const nextConfig = {
    experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ['mongoose']
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    },
  }
  
  module.exports = nextConfig