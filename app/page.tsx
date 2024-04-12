// "use client"

import HeroCarousel from "@/components/HeroCarousel"
import Searchbar from "@/components/SearchBar"
import { getAllProducts } from "@/lib/actions"
import ProductCard from "@/components/ProductCard"

import { FormEvent } from 'react'
// import cron from "node-cron"
// import { GET } from "./api/cron/route"

const Home = async () => {
  // cron.schedule('* * * * *', function() {
  //   console.log('running a task every minute');
  // });
  const allProducts = await getAllProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center"> 
            <h1 className="head-text">
              Экономьте вместе с нами
              {/* <span className="text-primary"> PriceWatcher</span> */}
            </h1>
            <Searchbar />
          </div>
          {/* <HeroCarousel /> */}
        </div>
      </section>

      <section className="trending-section">
        <div className="flex flex-wrap gap-x-8">
          <h2 className="section-text">Отслеживаемые товары</h2>
        </div>
        
        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}

export default Home