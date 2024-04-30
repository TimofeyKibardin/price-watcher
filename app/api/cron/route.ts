import { NextResponse } from "next/server";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import pw from 'playwright';

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeWildberriesProduct, scrapeKazanexpressProduct } from "@/lib/scraper";


export async function GET() {
  console.log('Подключение к браузеру...');
  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    connectToDB();

    console.log("Обновление информации о товарах");
    const products = await Product.find({});
    if (!products) throw new Error("Не получили товары");

    //1. Проходим по сохраненным товарам и обновляем базу данных
    const productsToUpdate = await Promise.all(
      products.map(async (productToUpdate) => {
        const page = await context.newPage();
        console.log('Подключение прошло успешно! Направляемся по ссылкам...');

        let scrapedProduct;

        if (productToUpdate.url.includes('wildberries')) {
          scrapedProduct = await scrapeWildberriesProduct(productToUpdate.url, page);
        } else if (productToUpdate.url.includes('kazanexpress')) {
          scrapedProduct = await scrapeKazanexpressProduct(productToUpdate.url, page);
        }

        if (!scrapedProduct) return new Error("Товары не найдены");

        const updatedPriceHistory = [
          ...productToUpdate.priceHistory,
          { price: scrapedProduct.currentPrice }
        ];  

        const foundProduct = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: foundProduct.url },
          foundProduct
        );

        //2. Смотрим статус товаров и отправляем на почту оповещение если необходимо
        const emailNotificationType = getEmailNotifType(
          scrapedProduct,
          productToUpdate
        );

        if (emailNotificationType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = await generateEmailBody(productInfo, emailNotificationType);
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: productsToUpdate,
    });

  } catch (error: any) {
    throw new Error(`Ошибка получения списка товаров: ${error.message}`);
  } finally {
    await browser.close();
  }
}