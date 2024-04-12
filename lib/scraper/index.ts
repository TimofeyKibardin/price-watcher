"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice, percentage } from '../utils';
import { PriceHistoryItem } from '@/types';

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    // Fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    // Extract the product title
    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount:100,
      stars: 4.5,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}


export async function scrapeWildberriesProduct(url: string, page: any) {
  //Возврат из функции, если передан пустой url
  if (!url) return;
  try {
    //Перенаправляемся по ссылке
    await page.goto(url);
    console.log('Направление прошло успешно! Ожидаем загрузку элемента вёрстки...');
    //Ожидаем элемент верстки
    const body = await page.waitForSelector('h1');

    const allArticles: any = await page.evaluate(() => {
      const articles = document.querySelectorAll('main');
      
      return Array.from(articles).map((article) => {
        const title = article.querySelector('h1')?.innerText;
        const currentPrice = article.querySelector('.price-block__final-price')?.textContent;
        const originalPrice = article.querySelector('.price-block__old-price')?.textContent;
        const stars = article.querySelector('.product-page .product-page__common-info .product-review__rating')?.textContent;
        const reviewsCount = article.querySelector('.product-page .product-page__common-info .product-review__count-review')?.textContent;
        const category = article.querySelector('.breadcrumbs li:nth-child(3) .breadcrumbs__link')?.textContent;
        const description = article.querySelector('p .option__text')?.textContent; //Не получается пока что достать текст контент
        const image = article.querySelector('.product-page .photo-zoom__preview')?.getAttribute('src');
        const articleNumber = article.querySelector('#productNmId')?.textContent;
        const sellerName = article.querySelector('.seller-info__name')?.textContent;
        return { title, currentPrice, originalPrice, stars, reviewsCount, category, description, image, articleNumber, sellerName };
      });
    });

    //Парсим данные
    const title = allArticles[0].title?.trim();
    const currentPrice = extractPrice(allArticles[0].currentPrice);
    const originalPrice = !!allArticles[0].originalPrice ? extractPrice(allArticles[0].originalPrice) : allArticles[0].currentPrice;
    const stars = allArticles[0].stars?.trim();
    const reviewsCount = allArticles[0].reviewsCount?.trim().replace(/[\D]+/g, '');
    const category = allArticles[0].category?.trim();
    const description = allArticles[0].description;
    const image = allArticles.length > 0 ? allArticles[0].image : null;
    const articleNumber = allArticles[0].articleNumber;
    const sellerName = allArticles[0].sellerName?.trim();

    //Создаем объект с полученной информацией
    const data = {
      url,
      marketplaceType: "Wildberries",
      title: String(title),
      currency: '₽',
      image: String(image),
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [{
        price: Number(currentPrice),
        date: new Date()
      }],
      discountRate: String((originalPrice && currentPrice) ? percentage(Number(currentPrice), Number(originalPrice)).toFixed() : ''),
      category: String(category),
      reviewsCount: Number(reviewsCount || 0),
      stars: Number(stars || 0),
      isOutOfStock: false,
      description: String(description),
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      articleNumber: String(articleNumber),
      sellerName: String(sellerName)
    }
    console.log(data);
    return data;

  } catch (error: any) {
    throw new Error(`Ошибка скрейпинга товара: ${error.message}`);
  }
}


export async function scrapeKazanexpressProduct(url: string, page: any) {
  if(!url) return;
  try {
    console.log('Подключение прошло успешно! Перенаправление на новую страницу Kazanexpress');

    await page.goto(url);
    await sleep(3000);
    console.log('Перенаправились! Скрейпинг в процессе...');

    const content = await page.content();
    // console.log(content);
    var scriptJSON = content.slice(content.indexOf('+json">'), content.indexOf('/script></div>'));
    scriptJSON = scriptJSON.slice(7, scriptJSON.length - 1);
    var scriptJS = JSON.parse(scriptJSON);

    const allArticles: any = await page.evaluate(() => {
        const articles = document.querySelectorAll('main'); 
        return Array.from(articles).map((article) => {
          const title = article.querySelector('h1')?.innerText;
          return { title };
        });
    });

    //Парсим данные
    const title = allArticles[0].title?.trim();
    const currentPrice = scriptJS.offers?.price;
    const originalPrice = !!scriptJS.offers?.price ? scriptJS.offers?.price : scriptJS.offers?.price;
    const stars = scriptJS.aggregateRating?.ratingValue;
    const reviewsCount = scriptJS.aggregateRating?.reviewCount;
    // const description = allArticles[0].description;
    const image = scriptJS.image[0];
    const sellerName = scriptJS.brand?.name;

    //Создаем объект с полученной информацией
    const data = {
      url,
      marketplaceType: "Kazanexpress",
      title: String(title),
      currency: '₽',
      image: String(image),
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [{
        price: Number(currentPrice),
        date: new Date()
      }],
      discountRate: String((originalPrice && currentPrice) ? percentage(Number(currentPrice), Number(originalPrice)).toFixed() : ''),
      category: 'отсутствует',
      reviewsCount: Number(reviewsCount || 0),
      stars: Number(stars || 0),
      isOutOfStock: false,
      description: "",
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      articleNumber: 'отсутствует',
      sellerName: String(sellerName)
    }
    console.log(data);
    return data;

  } catch (error: any) {
    console.log(error);
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}