"use client"

import { CartProductType, ProductPageDataType } from "@/lib/types";
import { FC, ReactNode, useEffect, useState } from  "react";
import ProductSwiper from "./product-swiper";
import ProductInfo from "./product-info/product-info";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-cart";
import { cn, isProductValidToAdd } from "@/lib/utils";
import QuantitySelector from "./quantity-selector";
import SocialShare from "../shared/social-share";
import { ProductVariantImage } from "@prisma/client";

interface Props {
    productData: ProductPageDataType;
    sizeId: string | undefined;
    children: ReactNode;
}

const ProductPageContainer: FC<Props> = ( { productData, sizeId, children }) => {
    // If there is no product data available, render nothing (null)
    if(!productData)return null;
    const { images, shippingDetails, sizes } = productData;
    if (typeof shippingDetails === "boolean") return null;
    
    const [variantImages, setVariantImages] = useState<ProductVariantImage[]>(images)

    const [activeImage, setActiveImage] = useState<ProductVariantImage | null>(
        images[0]
    )

    // Initialize the default product data for the cart item
    const data: CartProductType={
        productId: productData.productId,
        variantId: productData.variantId,
        productSlug: productData.productSlug,
        variantSlug: productData.variantSlug,
        name: productData.name,
        variantName: productData.variantName,
        image: images[0].url,
        variantImage: productData.variantImage,
        quantity: 1,
        price: 0,
        sizeId: sizeId || "",
        size: "",
        stock: 9,
        weight: productData.weight || 0,
        shippingMethod: shippingDetails.shippingFeeMethod,
        shippingService: shippingDetails.shippingService,
        shippingFee: shippingDetails.shippingFee,
        extraShippingFee: shippingDetails.extraShippingFee,
        deliveryTimeMin: shippingDetails.deliveryTimeMin,
        deliveryTimeMax: shippingDetails.deliveryTimeMax,
        isFreeShipping: shippingDetails.isFreeShipping,
    }

    // useState hook to manage the product's state in the cart
    const[productToBeAddedToCart, setProductToBeAddedToCart ] = useState<CartProductType>(data);

    //useState hook to manage product validity to be added to cart
    const [isProductValid, setIsProductValid] = useState<boolean>(false);

    //Function to handle stae changes for the product prodperties
    const handleChange = (property: keyof CartProductType, value: any) => {
        setProductToBeAddedToCart((prevProduct) => ({
            ...prevProduct,
            [property]: value,
        }));
    };

    useEffect(() => {
        const check = isProductValidToAdd(productToBeAddedToCart);
        setIsProductValid(check);
    },[productToBeAddedToCart]);

    return (
        <div className="relative">
            <div className="w-full xl:flex xl:gap-4">
                {/* Product iamges swiper */}
                <ProductSwiper 
                  images={variantImages.length > 0 ? variantImages:images} 
                  activeImage={activeImage || images[0]}
                  setActiveImage={setActiveImage}
                />
                <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
                    {/* Product main info */}
                    <ProductInfo 
                      productData={productData} 
                      sizeId={sizeId} 
                      handleChange={handleChange}
                      setVariantImages={setVariantImages}
                      setActiveImage={setActiveImage}
                      />

                    {/**Shipping details - buy actions buttons */}
                    <div className="w-[390px]">
                        <div className="z-20">
                            <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
                                {/*ship to */}
                                {
                                    typeof shippingDetails !== "boolean" && (
                                    <>
                                   <ShipTo 
                                    countryCode={shippingDetails.countryCode} 
                                    countryName={shippingDetails.countryName}
                                    city={shippingDetails.city}
                                    />
                                    <div className="mt-3 space-y-3">
                                        <ShippingDetails 
                                        shippingDetails={shippingDetails}
                                        quantity={1}
                                        weight={productData.weight}
                                        />
                                </div>
                                <ReturnPrivacySecurityCard 
                                  returnPolicy={shippingDetails.reutrnPolicy}
                                />
                             </>
                            )}
                            {/**Action buttons */}
                            <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
                                {/* Qty selector */}
                                {sizeId && (
                                    <div className="w-full flex justify-end mt-4">
                                        <QuantitySelector 
                                            productId = {productToBeAddedToCart.productId}
                                            variantId = {productToBeAddedToCart.variantId}
                                            sizeId = {productToBeAddedToCart.sizeId}
                                            quantity = {productToBeAddedToCart.quantity}
                                            stock = {productToBeAddedToCart.stock}
                                            handleChange = {handleChange}
                                            sizes = {sizes}
                                        />
                                    </div>
                                )}
                                {/**Action buttons */}
                                <button 
                                     className={cn(
                                        "relative w-full py-2.5 min-w-20 bg-orange-background hover:bg-orange-hover text-white h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none",
                                        {
                                           "cursor-not-allowed": !isProductValid,
                                        }
                                      )}
                                      >
                                    <span>Buy now</span>
                                </button>
                                <button
                                    disabled={!isProductValid}
                                    className={cn(
                                        "relative w-full py-2.5 min-w-20 bg-orange-border hover:bg-[#e4cdce] text-orange-hover h-11 rounded-3xl leading-6 inline-block font-bold whitespace-nowrap border border-orange-border cursor-pointer transition-all duration-300 ease-bezier-1 select-none",
                                        {
                                         "cursor-not-allowed": !isProductValid,
                                        }
                                    )}
                                    // onClick={() => handleAddToCart()}
                                    >
                                    <span>Add to cart</span>
                                </button>
                                {/**Share to socils */}
                                <SocialShare 
                                  url={`/product/${productData.productSlug}/${productData.variantSlug}`}
                                  quote={`${productData.name} . ${productData.variantName}`}
                                />
                            </div>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
            <div className="w-[calc(100%-390px)] mt-6 pb-16">{children}</div>

        </div>
    )
};

export default ProductPageContainer;
