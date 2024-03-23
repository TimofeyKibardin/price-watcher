import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import pw from 'playwright';
import Product from "@/lib/models/product.model";
import { scrapeWildberriesProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 10; // Функция может работать максимум 10 секунд, ограничения тарифа
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    connectToDB();

    const products = await Product.find({});

    if (!products) throw new Error("Не получили товары");

    //Открываем подключение к браузеру
    // const SBR_CDP = `wss://${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}@brd.superproxy.io:9222`;
    console.log('Подключение к браузеру для скрейпинга...');
    // const browser = await pw.chromium.launch({ headless: true });
    const browser = await pw.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    // ======================== 1. Проходим по сохраненным товарам и обновляем базу данных
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        //Получаем информацию по товарам
        const scrapedProduct = await scrapeWildberriesProduct(currentProduct.url, page);

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

    await context.close();
    await browser.close();

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Ошибка получения списка товаров: ${error.message}`);
  }
}