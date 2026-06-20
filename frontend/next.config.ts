/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: Allow local network access (mobile/other devices)
  allowedDevOrigins: [
    "192.168.0.112",
    "192.168.0.*",
    "localhost",
    "127.0.0.1",
  ],

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000",
  },
};

module.exports = nextConfig;