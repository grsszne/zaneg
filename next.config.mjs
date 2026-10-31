import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import { laserAssetRedirects } from './src/app/lib/laser-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{
      source: '/laser!',
      destination: '/laser',
      permanent: true,
    }, {
      source: '/posts/laser-sending-data-through-light',
      destination: '/laser',
      permanent: true,
    }, ...laserAssetRedirects()];
  },
  turbopack: {
    root: __dirname,
  },
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

export default function config(phase) {
  return {
    ...nextConfig,
    // Keep production builds from overwriting a running dev server's artifacts.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  };
}
