import ProductDetails from "@/components/dashboard/forms/product-details";
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";

export default async function SellerNewProductPage({
    params,
}: {
    params: Promise<{storeUrl: string }>;
}) {
    const categories = await getAllCategories();
    const offerTags = await getAllOfferTags();
    const {storeUrl} = await params;
    return <div className="w-full">
        <ProductDetails categories={categories} storeUrl={storeUrl} 
        offerTags={offerTags}
        />
    </div>;
}
