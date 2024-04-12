import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import pw from 'playwright';
import Product from "@/lib/models/product.model";
import { scrapeWildberriesProduct, scrapeKazanexpressProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 10; // Функция может работать максимум 10 секунд
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    //Подключение к БД
    connectToDB();

    console.log("Обновление информации о товарах");
    const products = await Product.find({});

    //Если товаров нет, то возврат
    if (!products) throw new Error("Не получили товары");

    console.log("Количество товаров: " + products.length);

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

    const page = await browser.newPage();
    console.log('Подключение прошло успешно! Направляемся по ссылкам...');

    // ======================== 1. Проходим по сохраненным товарам и обновляем базу данных
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        //Получаем информацию по товарам
        let scrapedProduct;

        if (currentProduct.url.includes('wildberries')) {
          scrapedProduct = await scrapeWildberriesProduct(currentProduct.url, page);
        } else if (currentProduct.url.includes('kazanexpress')) {
          scrapedProduct = await scrapeKazanexpressProduct(currentProduct.url, page);
        }

        if (!scrapedProduct) return new Error("Товары не найдены");

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice }
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        //Обновляем товары в БД
        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product
        );

        // ======================== 2. Смотрим статус товаров и отправляем на почту оповещение если необходимо
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Создаем содержимое сообщения
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Получаем массив пользователей для рассылки
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          // Рассылаем email-оповещения
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    await page.close();
    await browser.close();

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });

  } catch (error: any) {
    throw new Error(`Ошибка получения списка товаров: ${error.message}`);
  }
}