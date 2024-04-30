import { NextResponse } from "next/server";
import pw from 'playwright';
import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeWildberriesProduct, scrapeKazanexpressProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export async function GET() {
  console.log('Подключение к браузеру...');
  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    connectToDB();

    console.log("Обновление информации о товарах");
    const products = await Product.find({});

    if (!products) throw new Error("Не получили товары");

    console.log("Количество товаров: " + products.length);

    // ======================== 1. Проходим по сохраненным товарам и обновляем базу данных
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const page = await context.newPage();
        console.log('Подключение прошло успешно! Направляемся по ссылкам...');

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

          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });

  } catch (error: any) {
    throw new Error(`Ошибка получения списка товаров: ${error.message}`);
  } finally {
    await browser.close();
  }
}