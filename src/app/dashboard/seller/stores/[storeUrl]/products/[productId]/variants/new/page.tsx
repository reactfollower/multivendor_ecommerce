import ProductDetails from "@/components/dashboard/forms/product-details";

// Queries
import { getAllCategories } from  "@/queries/category";
import { getProductMainInfo } from "@/queries/product";
import { getAllOfferTags } from "@/queries/offer-tag";

export default async function SellerNewProductVariantPage({
    params,
}:{
    params: Promise<{productId: string; storeUrl:string}>
}) {
    const categories = await getAllCategories();
    const product = await getProductMainInfo((await params).productId);
    const offerTags = await getAllOfferTags();
    if (!product) return null;
    return (
        <div>
            <ProductDetails 
               categories={categories} 
               storeUrl={(await params).storeUrl} 
               offerTags={offerTags}
               data = {product}
               />
        </div>
    );
}
