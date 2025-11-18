/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/grsszne/zaneg.net--assets/blob/main/static/imgs/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/grsszne/zaneg.net--assets/**',
      },
    ],
  },
};

export default nextConfig;