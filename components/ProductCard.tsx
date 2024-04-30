import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

import { Product } from '@/types';
import { formatNumber } from "@/lib/utils";


interface Props {
  product: Product;
}
 
const ProductCard = ({ product }: Props) => {
  return (
    <Link
      href={`/products/${product._id}`}
      className="product-shortinfo"
    >
      <div className="product-shortinfo_img-container">
        <Image 
          src={product.image}
          alt={product.title}
          width={200}
          height={200}
          className="product-shortinfo_img"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="product-shortinfo_title">{product.title}</h3>

        <div className="flex justify-between">
          <p className="text-blue-600 opacity-50 text-lg capitalize">
            {product.category}
          </p>

          <p className="text-black text-lg font-semibold">
            
            <span>{formatNumber(product?.currentPrice)}</span>
            <span> {product?.currency}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard