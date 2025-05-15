/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'promptcrate.ai',
          },
        ],
        permanent: true,
        destination: 'https://promptcrate.ai/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
