import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getProductById } from "@/lib/actions"
import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import PriceChart from "@/components/PriceChart";


type Props = {
  params: { id: string }
}

const marketplaceType = {
  Wildberries: {
    name: 'Wildberries',
    color: '#7D256F'
  },
  Kazanexpress: {
    name: 'Kazanexpress',
    color: '#E63737'
  }
}

const ProductDetails = async ({ params: { id } }: Props) => {
  const product: Product = await getProductById(id);

  if(!product) redirect('/')

  return (
    <div className="product-container">
      <div className="flex gap-20 flex-row">
        

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-2">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>

              <Link
                href={product.url}
                target="_blank"
                className="text-base text-blue-600"
              >
                Посмотреть товар
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <div className="product-shop_name" style={{backgroundColor: product.marketplaceType == 'Wildberries' ? marketplaceType.Wildberries.color : marketplaceType.Kazanexpress.color}}>
                <p className="text-base text-white text-secondary font-semibold">
                  {product.marketplaceType}
                </p>
              </div>

              <div className="product-like_count">
                <Image 
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-base text-[#D46F77] font-semibold">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="product-stars">
                <Image 
                  src="/assets/icons/star.svg"
                  alt="star"
                  width={20}
                  height={20}
                />
                <p className="text-base text-primary-orange font-semibold">
                  {product.stars || '0'}
                </p>
              </div>

              <div className="product-seller">
                <p className="text-base text-secondary font-semibold">
                  {product.sellerName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
              <p className="text-sm text-secondary opacity-50">
                Артикул: {product.articleNumber}
              </p>
            </div>

          <div className="product-info">
            <div className="flex flex-row gap-4">
              <p className="text-[30px] text-secondary font-bold">
              {formatNumber(product.currentPrice)} {product.currency}
              </p>
              <p className="text-[18px] text-black opacity-50 line-through">
              {formatNumber(product.originalPrice)} {product.currency}
              </p>
            </div>
          </div>

          <div className="my-2 flex flex-col gap-5">
            <div className="flex gap-1 flex-wrap">
              <PriceInfoCard 
                title="Текущая цена"
                iconSrc="/assets/icons/price-tag-new.webp"
                value={`${product.currency} ${formatNumber(product.currentPrice)}`}
              />
              <PriceInfoCard 
                title="Средняя цена"
                iconSrc="/assets/icons/chart-icon-new.webp"
                value={`${product.currency} ${formatNumber(product.averagePrice)}`}
              />
              <PriceInfoCard 
                title="Самая высокая цена"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(product.highestPrice)}`}
              />
              <PriceInfoCard 
                title="Самая низкая цена"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(product.lowestPrice)}`}
              />
            </div>
          </div>

          <Modal productId={id} />
          <div className="my-3 flex flex-col gap-5 h-12">
            <PriceChart
              labels={product.priceHistory.map((priceHist: any) => {
                return priceHist.date.getDate() + '.' + (priceHist.date.getMonth() + 1) + '.' + priceHist.date.getFullYear();
              })}
              dataset={product.priceHistory.map((priceHist: any) => priceHist.price)}
            />
          </div>
          
        </div>

        <div className="product-image">
          <Image 
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <button className="button-main w-fit flex items-center justify-center gap-3 min-w-[150px]">
          <Link href="/" className="text-base text-white">
            На главную
          </Link>
        </button>
      </div>
    </div>
  )
}

export default ProductDetails