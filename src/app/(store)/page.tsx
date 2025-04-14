//  import { getUserCountry } from "@/lib/utils";
// import { UserButton } from "@clerk/nextjs";
// import { seedCountires } from "@/migration-scripts/seed-countries";
import ProductList from "@/components/sotre/shared/product-list";
import { getProducts } from "@/queries/product";

export default async function HomePage() {
  const productsData = await getProducts();
  const { products } = productsData;
  // await seedCountires()
  //  const res = await getUserCountry();
  //  console.log(res);
  return (
    <div className="p-14">
        <ProductList products={products} title="Produts" arrow />
    </div>
  );
}
