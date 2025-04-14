/* eslint-disable @typescript-eslint/no-unused-vars */
// Queries
import DataTable from "@/components/ui/data-table";
import { getAllStoreProducts } from "@/queries/product";
import { columns } from "./columns";
import CategoryDetails from "@/components/dashboard/forms/category-details";
import { Plus } from "lucide-react";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { getAllCategories } from "@/queries/category";
import { getAllOfferTags } from "@/queries/offer-tag";
export default async function SellerProductPage({
    params,
}:{
    //params: {
        // storeUrl: string; sotreUrl: string 
        params: Promise<{storeUrl: string }>;
//};
}) {
    // Fetching products data from the database for the active store
    const {storeUrl} = await params;
    const products = await getAllStoreProducts(storeUrl);
    const categories = await getAllCategories();
    const offerTags = await getAllOfferTags();
    return (
        <DataTable
             actionButtonText = {
                <>
                <Plus size={15} />
                Create product
                </>
             }
        modalChildren = {
          <ProductDetails 
            categories={categories} 
            offerTags={offerTags} 
            storeUrl={storeUrl} 
            />
        }
        newTabLink={`/dashboard/seller/stores/${storeUrl}/products/new`}
        filterValue="name"
        data = {products}
        columns = {columns}
        searchPlaceholder="Search product name..."
        />     
    );   
}