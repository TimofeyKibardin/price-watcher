import Searchbar from "@/components/SearchBar"
import { getAllProducts } from "@/lib/actions"
import ProductCard from "@/components/ProductCard"
import { revalidatePath } from "next/cache";
import { cronJob } from "@/lib/actions/cronJob";



const Home = async () => {
  let allProducts = await getAllProducts();
  revalidatePath('/');

  cronJob.start();

  return (
    <>
      <section className="px-6 md:px-20 py-3">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center"> 
            <h1 className="head-text">
              Начните экономить сегодня
            </h1>
            <Searchbar />
          </div>
        </div>
      </section>

      <section className="trending-section">
        <div className="flex flex-wrap gap-x-8">
          <h2 className="section-text">Отслеживаемые <span className="text-blue-600">товары</span></h2>
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