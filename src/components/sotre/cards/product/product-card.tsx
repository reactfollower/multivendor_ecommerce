"use client"

import { ProductType, VariantSimplified } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import ReactStars from "react-rating-stars-component";
import ProductCardImageSwiper from "./swiper";
import VariantSwitcher from "./variant-swithcer";
import  { cn } from "@/lib/utils";
import { Button } from "@/components/sotre/ui/button";
import { Heart } from "lucide-react";
import ProductPrice from "../../product-page/product-info/product-price";

export default function ProductCard( {product }:{product: ProductType }) {
    const { name, slug, rating, sales, variantImages, variants, id } = product;
    const [variant, setVariant] = useState<VariantSimplified>(variants[0]);
    console.log(variant);
    if(variant == null)return (<div></div>);
    const { variantSlug, variantName, images, sizes } = variant;
    return <div>
        <div className="group w-48 sm:w-[225px] relative transition-all duration-75 bg-white ease-in-out p-4 rounded-t-3xl border-transparent hover:shadow-xl hover:border-border">
          <div className="relative w-full h-full">
            <Link 
              href={`/product/${slug}/${variantSlug}`}
              className="w-full relative inline-block overflow-hidden"
              >
                {/* Images Swiper */}
                <ProductCardImageSwiper images={images} />
                {/* Title */}
                <div className="text-sm text-main-primary h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
                    {name} . {variantName}
                </div>
                {/* Rating - Sales */}
                {product.rating > 0 && product.sales > 0 && (
                    <div className="flex items-center gap-x-1 h-5">
                      <ReactStars
                        count={5}
                        size={24}
                        color="#F5F5F5"
                        activeColor="#FFD804"
                        value={rating}
                        isHalf
                        edit={false}
                    />
                    <div className="text-xs text-main-secondary">{sales} sold</div>
                 </div>
                )}
                {/* Price */}
                <ProductPrice sizes={sizes} isCard sizeId={undefined} />
            </Link>  
          </div>            
          <div className="hidden group-hover:block absolute -left-[1px] bg-white border border-t-0 w-[calc(100%+2px)] px-4 pb-4 roudned-b-3xl shadow-xl z-30 space-y-2">
            {/* Variant switcher */}
            <VariantSwitcher 
                 images={variantImages}
                variants={variants}
                setVariant={setVariant}
                selectedVariant={variant}
            />
            {/* Action buttons */ }
            <div className="flex flex-items gap-x-1">
              <Button>Add to cart</Button>
              <Button variant="black" size="icon">
                  <Heart style={{color:"white"}} className="w-5" />
              </Button>
            </div>
          </div>
        </div>
    </div>
}
