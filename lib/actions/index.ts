"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import pw from 'playwright';
import { scrapeWildberriesProduct, scrapeKazanexpressProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

// export async function scrapeAndStoreProduct(productUrl: string) {
//   if(!productUrl) return;

//   try {
//     connectToDB();
//     //Открываем подключение к браузеру
//     console.log('Подключение к браузеру для скрейпинга...');
//     const browser = await pw.chromium.launch({ headless: true });
//     const context = await browser.newContext();
//     const page = await context.newPage();
//     let scrapedProduct;
    
//     if (productUrl.includes('wildberries')) {
//       scrapedProduct = await scrapeWildberriesProduct(productUrl, page);
//     } else if (productUrl.includes('kazanexpress')) {
//       scrapedProduct = await scrapeKazanexpressProduct(productUrl, page);
//     }

//     await context.close();
//     await browser.close();

//     if(!scrapedProduct) return;

//     let product = scrapedProduct;

//     const existingProduct = await Product.findOne({ url: scrapedProduct.url });

//     if(existingProduct) {
//       const updatedPriceHistory: any = [
//         ...existingProduct.priceHistory,
//         { price: scrapedProduct.currentPrice }
//       ];

//       product = {
//         ...scrapedProduct,
//         priceHistory: updatedPriceHistory,
//         lowestPrice: getLowestPrice(updatedPriceHistory),
//         highestPrice: getHighestPrice(updatedPriceHistory),
//         averagePrice: getAveragePrice(updatedPriceHistory),
//       }
//     }

//     const newProduct = await Product.findOneAndUpdate(
//       { url: scrapedProduct.url },
//       product,
//       { upsert: true, new: true }
//     );

//     revalidatePath(`/products/${newProduct._id}`);
//   } catch (error: any) {
//     throw new Error(`Ошибка создания/обновления продукта: ${error.message}`)
//   }
// }

// export async function getProductById(productId: string) {
//   try {
//     connectToDB();

//     const product = await Product.findOne({ _id: productId });

//     if(!product) return null;

//     return product;
//   } catch (error) {
//     console.log(error);
//   }
// }

export async function scrapeAndStoreProduct(productUrl: string) {
  if(!productUrl) return;

  //Подключение к базе данных
  connectToDB();

  //Конфигурация прокси
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 9222;
  const sessionID = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${sessionID}`,
      password
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false
  }

  //Открываем подключение к браузеру
  console.log('Подключение к браузеру...');
  const SBR_CDP = `wss://${options.auth.username}:${options.auth.password}@${options.host}:${options.port}`;
  const browser = await pw.chromium.connectOverCDP(SBR_CDP);

  try {
    //Открываем страницу
    const page = await browser.newPage();
    console.log('Подключение прошло успешно! Направляемся по ссылке...');
    let scrapedProduct;

    if (productUrl.includes('wildberries')) {
      scrapedProduct = await scrapeWildberriesProduct(productUrl, page);
    } else if (productUrl.includes('kazanexpress')) {
      scrapedProduct = await scrapeKazanexpressProduct(productUrl, page);
    }

    await page.close();

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice }
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Ошибка создания/обновления продукта: ${error.message}`)
  } finally {
    await browser.close();
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();
    console.log("Количество найденных товаров: " + products.length);
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
      console.log("email sended!  ");
    }
  } catch (error) {
    console.log(error);
  }
}