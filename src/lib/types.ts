import { getAllStoreProducts, getProductPageData, getProducts, getRatingStatistics, getShippingDetails, retrieveProductDetails } from "@/queries/product";
import { getStoreDefaultShippingDetails } from "@/queries/store";
import { getAllSubCategories } from "@/queries/subCategory";
import { FreeShipping, FreeShippingCountry, Prisma, ProductVariantImage, Review, ReviewImage, ShippingRate, Size, User } from "@prisma/client";

export interface DashboardSidebarMenuInterface {
    label: string;
    icon: string;
    link: string;
}

 export type SubCategoryWithCategoryType=Prisma.PromiseReturnType<
    typeof getAllSubCategories
    >[0];

    export type ProductWithVariantType = {
        productId: string;
        variantId: string;
        name: string;
        description: string;
        variantName: string;
        variantDescription: string;
        images: { id?: string; url: string }[];
        variantImage: string;
        categoryId: string;
        offerTagId: string;
        subCategoryId: string;
        isSale: boolean;
        saleEndDate?: string;
        brand: string;
        sku: string;
        weight: number;
        colors: { id?: string; color: string }[];
        sizes: {
          id?: string;
          size: string;
          quantity: number;
          price: number;
          discount: number;
        }[];
        product_specs: { id?: string; name: string; value: string }[];
        variant_specs: { id?: string; name: string; value: string }[];
        keywords: string[];
        questions: { id?: string; question: string; answer: string }[];
        //freeShippingForAllCountries: boolean;
        //freeShippingCountriesIds: { id?: string; label: string; value: string }[];
        // shippingFeeMethod: ShippingFeeMethod;
        createdAt: Date;
        updatedAt: Date;
      };

      export type StoreProductType = Prisma.PromiseReturnType<
      typeof getAllStoreProducts
      >[0];

      export type StoreDefaultShippingType = Prisma.PromiseReturnType<
      typeof getStoreDefaultShippingDetails
      >;
      
      export type CountryWithShippingRatesType = {
        countryId: string;
        countryName: string;
        shippingRate: ShippingRate;
      }
      
      export interface Country {
        name: string;
        code: string;
        city: string;
        region: string;
      }

      import countries from "@/data/countries.json";

      export type SelectMenuOption = (typeof countries)[number];

      export type ProductType = Prisma.PromiseReturnType<typeof getProducts>["products"][0];
        
      export type VariantSimplified = {
        variantId : string,
        variantSlug: string,
        variantName: string,
        images: ProductVariantImage[],
        sizes: Size[];
      };

      export type VariantImageType = {
        url : string;
        image: string;
      };

      export type ProductPageType = Prisma.PromiseReturnType<
         typeof retrieveProductDetails
         >;

      export type ProductPageDataType = Prisma.PromiseReturnType<
        typeof getProductPageData
        >;

     export type productShippingDetailsType = Prisma.PromiseReturnType<
     typeof getShippingDetails
     >;
       
     export type StatisticsCardType = Prisma.PromiseReturnType<
     typeof getRatingStatistics
     >["ratingStatistics"];

     export type RatingStatisticsType = Prisma.PromiseReturnType<
     typeof getRatingStatistics
     >;

     export type FreeShippingWithCountriesType = FreeShipping & {
      eligibaleCountries: FreeShippingCountry[];
     };
     
     export type CartProductType = {
      productId: string;
      variantId: string;
      productSlug: string;
      variantSlug: string;
      name: string;
      variantName: string;
      image: string;
      variantImage: string;
      sizeId: string;
      size: string;
      quantity: number;
      price: number;
      stock: number;
      weight: number;
      shippingMethod: string;
      shippingService: string;
      shippingFee: number;
      extraShippingFee: number;
      deliveryTimeMin: number;
      deliveryTimeMax: number;
      isFreeShipping: boolean;
    };

    export type ReivewWithImageType = Review & {
      images: ReviewImage[];
      user: User[];
    };
    