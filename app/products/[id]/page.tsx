import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import PriceChart from "@/components/PriceChart";
import { getProductById, getSimilarProducts } from "@/lib/actions"
import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  const similarProducts = await getSimilarProducts(id);

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
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

            <div className="flex items-center gap-1">
              <div className="p-2 rounded-10" style={{backgroundColor: product.marketplaceType == 'Wildberries' ? marketplaceType.Wildberries.color : marketplaceType.Kazanexpress.color}}>
                <p className="text-[14px] text-white text-secondary font-bold">
                  {product.marketplaceType}
                </p>
              </div>

              <div className="product-hearts">
                <Image 
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />
                <p className="text-base font-semibold text-[#D46F77]">
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
                  {product.stars || '25'}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <p className="text-[14px] text-secondary font-bold">
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
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>

            
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
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
        <button className="btn w-fit  flex items-center justify-center gap-3 min-w-[200px]">
          <Image 
            src="/assets/icons/bag.svg"
            alt="check"
            width={22}
            height={22}
          />
          
          <Link href="/" className="text-base text-white">
            На главную
          </Link>
        </button>
      </div>
    </div>
  )
}

export default ProductDetails