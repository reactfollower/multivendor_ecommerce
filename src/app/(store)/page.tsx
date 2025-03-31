// import { getUserCountry } from "@/lib/utils";
// import { UserButton } from "@clerk/nextjs";

import ProductList from "@/components/sotre/shared/product-list";
import { getProducts } from "@/queries/product";

export default async function HomePage() {
  const productsData = await getProducts();
  const { products } = productsData;
  // const res = await getUserCountry();
  // console.log(res);
  return (
    <div className="p-14">
        <ProductList products={products} title="Produts" arrow />
    </div>
  );
}
