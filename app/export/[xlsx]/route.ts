"use server"

import { NextRequest } from "next/server";
import * as XLSX from "xlsx";   
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";


export async function GET(
    request: NextRequest
) {
    try {
        await connectToDB();
        const products = await Product.find({});
        if (!products) throw new Error("Не получили товары");

        const dataToExport = products.map((product) => ({
            Артикул: product.articleNumber,
            Название: product.title,
            Цена: product.currentPrice,
            Категория: product.category,
            Маркетплейс: product.marketplaceType,
            Количество_отзывов: product.reviewsCount,
            Рейтинг: product.stars,
            Продавец: product.sellerName
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        fixWidth(worksheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });  

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="ProductList.xlsx"',
                'Content-Type': 'application/vnd.ms-excel',
            }
        });

    } catch (e) {
        if (e instanceof Error) {
            console.error(e)
            return new Response(e.message, {
                status: 400,
            })
        }
    }
}

function fixWidth(worksheet: XLSX.WorkSheet) {
    const data = XLSX.utils.sheet_to_json<any>(worksheet)
    const colLengths = Object.keys(data[0]).map((k) => k.toString().length)
    for (const d of data) {
      Object.values(d).forEach((element: any, index) => {
        const length = element.toString().length
        if (colLengths[index] < length) {
          colLengths[index] = length
        }
      })
    }
    worksheet["!cols"] = colLengths.map((l) => {
      return {
        wch: l,
      }
    })
  }