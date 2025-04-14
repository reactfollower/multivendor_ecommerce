/* eslint-disable @typescript-eslint/no-unused-vars */
import StoreCard from "@/components/sotre/cards/store-cards";
import ProductPageContainer from "@/components/sotre/product-page/container";
import ProductQuestions from "@/components/sotre/product-page/product-questions";
import ProductSpecs from "@/components/sotre/product-page/product-specs";
import ProductDescription from "@/components/sotre/product-page/production-description";
import RelatedProducts from "@/components/sotre/product-page/related-product";
import ProductReviews from "@/components/sotre/product-page/reviews/product-reviews";
import StoreProducts from "@/components/sotre/product-page/store-products";
import { getProductPageData, getProducts } from "@/queries/product";
import { Separator } from "@radix-ui/react-select";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    //params: { productSlug: string; variantSlug: string };
    params: Promise<{productSlug: string; variantSlug:string}>
    searchParams: Promise<{
        size?: string;
    }>
}

export default async function ProductVariantPage({
    params,
    searchParams,
}: {
    params: Promise<{productSlug: string; variantSlug:string}>;
    searchParams: Promise<{size?: string;}>
  }
)
  // params: Promise<{productSlug: string; variantSlug:string;}>;
   
 {
     const productSlug = (await params).productSlug;
     const variantSlug = (await params).variantSlug;
     const sizeId = (await searchParams).size;
       
    // Fetch product data based on the product slug and variant slug
    const productData = await getProductPageData(productSlug, variantSlug);
    
    // If no product data is found, show the 404 Not Found page
    if (!productData) {
        return notFound();
        //return redirect("/");
    }

    // Extract the available sizes for the product variant
    const { sizes } = productData;
    // If the size is provided in the URL
    if(sizeId) {
        // Check if the provided sizeId is valid by comparing with available sizes
        const isValidSize = sizes.some((size) => size.id === sizeId);

        // If the sizeId is not valid, redirect to the same product page without the size page
        if (!isValidSize) {
            return redirect(`/product/${productSlug}/${variantSlug}`);
        }
    }

    //If no sizeId is provided and there's only one size available, automatically select
    else if (sizes.length === 1) {
        return redirect(
            `/product/${productSlug}/${variantSlug}?size=${sizes[0].id}`
        );
    }

    const {specs, questions, shippingDetails, category, subCategory, store, reviewStatistics, reviews } = productData;

    const relatedProducts = await getProducts({category: category.url }, "",1,12);

    console.log("productData.store", productData.store);
    return (
        <div>
            <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
                <ProductPageContainer productData={productData} sizeId={sizeId}>
                    <>
                      <Separator />
                      {/* Related products */}
                      <RelatedProducts products={relatedProducts.products} />
                    </>
                    <Separator className="mt-6" />
                    {/* Product reviews */}
                    <ProductReviews 
                      productId = {productData.productId}
                      rating = {productData.rating}
                      statistics={reviewStatistics}
                      reviews = {reviews}
                      />
                    <>
                    <Separator className="mt-6" />
                    {/* Product description */}
                    <ProductDescription 
                        text={[productData.description, 
                               productData.variantDescription || "",
                    ]}
                    />
                    </>
                    {(specs.product.length > 0 || specs.variant.length > 0) && (
                        <>
                          <Separator className="mt-6" />
                          {/* Specs table */}
                          <ProductSpecs specs={specs} />
                        </>
                    )}
                    {questions.length > 0 && (
                        <>
                          <Separator className="mt-6" />
                          {/* Product Questions */}
                          <ProductQuestions questions={productData.questions} />
                        </>
                    )}
                    <Separator className="my-6" />
                      {/* Store card */}
                      <StoreCard store={productData.store} />
                      {/* Store products */}
                      <StoreProducts storeUrl = {store.url} storeName={store.name} count={6} />
                </ProductPageContainer>
            </div>
        </div>
    );
}
