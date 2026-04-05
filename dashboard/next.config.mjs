/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloudflare pages requires strict Next config.
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
