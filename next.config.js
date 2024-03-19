/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
      serverComponentsExternalPackages: ['mongoose']
    },
    images: {
      domains: ['m.media-amazon.com', "basket-01.wbbasket.ru", "basket-02.wbbasket.ru", "basket-03.wbbasket.ru", "basket-04.wbbasket.ru",
      "basket-5.wbbasket.ru", "basket-6.wbbasket.ru", "basket-7.wbbasket.ru", "basket-8.wbbasket.ru", "basket-9.wbbasket.ru",
      "basket-10.wbbasket.ru", "basket-11.wbbasket.ru", "basket-12.wbbasket.ru", "basket-13.wbbasket.ru", "basket-14.wbbasket.ru"]
    }
  }
  
  module.exports = nextConfig