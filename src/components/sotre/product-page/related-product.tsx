import { ProductType } from "@lib/types";
import React from "react";
import ProductList from "../shared/product-list"

export default function RelatedProducts({
    products,
}:{
    products: ProductType[];
}) {
    return (
        <div className="mt-1 space-y-1">
            <ProductList products = {products} title="Related products" />
        </div>
    );
};
