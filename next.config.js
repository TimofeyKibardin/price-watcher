/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ['mongoose']
    },
    images: {
      domains: ['m.media-amazon.com', "basket-12.wbbasket.ru", "basket-13.wbbasket.ru"]
    }
  }
  
  module.exports = nextConfig