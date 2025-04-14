"use server";

// DB
import { db } from "@/lib/db";

// Types
import {
  FreeShippingWithCountriesType,
  ProductPageType,
  productShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";

import { ProductVariant, Size, Store } from "@prisma/client";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Slugify
import slugify from "slugify";

// import slugify from "slugify";
import { generateUniqueSlug } from "@/lib/utils";

// Cookies
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";

import { setMaxListeners } from "events";
import { Description } from "@radix-ui/react-toast";
import { SignalZero } from "lucide-react";
import { sign } from "crypto";
import { SignedIn } from "@clerk/nextjs";
import { filterFns } from "@tanstack/react-table";
import ProductDetails from "@/components/dashboard/forms/product-details";
import { Variant } from "framer-motion";
import { getStoreDefaultShippingDetails } from "./store";

export const upsertProduct = async (
    product: ProductWithVariantType,
    storeUrl: string
  ) => {
    // console.log(product);
    // console.log(storeUrl);
    try {
      // Retrieve current user
      const user = await currentUser();
  
      // Check if user is authenticated
      if (!user) throw new Error("Unauthenticated.");
  
      // Ensure user has seller privileges
      if (user.privateMetadata.role !== "SELLER")
        throw new Error(
          "Unauthorized Access: Seller Privileges Required for Entry."
        );
  
      // Ensure product data is provided
      if (!product) throw new Error("Please provide product data.");
  
      // Find the store by URL
      const store = await db.store.findUnique({
        where: { url: storeUrl, userId: user.id },
      });
      if (!store) throw new Error("Store not found.");
  
      // Generate unique slugs for product and variant
      const productSlug = await generateUniqueSlug(
        slugify(product.name, {
          replacement: "-",
          lower: true,
          trim: true,
        }),
        "product"
      )

      const variantSlug = await generateUniqueSlug(
        slugify(product.variantName, {
          replacement: "-",
          lower: true,
          trim: true,
        }),
        "productVariant"
      );

      // Common data for product and variant
      const commonProductData = {
        name: product.name,
        description: product.description,
        slug: productSlug,
        brand: product.brand,
        specs: {
          create: product.product_specs.map((spec) => ({
            name: spec.name,
            value: spec.value,
          })),
        },
        questions: {
          create: product.questions.map((question) => ({
            question: question.question,
            answer: question.answer
          })),
        },
        store: { connect: {id: store.id }},
        category: { connect: {id: product.categoryId }},
        subCategory: { connect: {id: product.subCategoryId }},
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      const commonVariantData = {
        variantName: product.variantName,
        variantDescription: product.variantDescription,
        slug: variantSlug,
        isSale: product.isSale,
        sku: product.sku,
        weight:product.weight,
        keywords: product.keywords.join(","),
        specs: {
          create: product.variant_specs.map((spec) => ({
            name: spec.name,
            value: spec.value,
          })),
        },
        images: {
          create: product.images.map((image) => ({
            url:image.url,
            alt: image.url.split("/").pop() || "",
          })),
        },
        variantImage: product.variantImage,
        colors: {
          create: product.colors.map((color) => ({
            name: color.color,
          })),
        },
        sizes: {
          create: product.sizes.map((size) => ({
            size: size.size,
            quantity: size.quantity,
            price: size.price,
            discount: size.discount,
          })),
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      // Check if the product already exists
      const existingProduct = await db.product.findUnique({
        where: { id: product.productId },
      });
  
      // Check if the variant already exists
      const existingVariant = await db.productVariant.findUnique({
        where: { id: product.variantId },
      });
  
      if (existingProduct) {
        const variantData = {
          ...commonVariantData,
          product: { connect: { id: product.productId } },
        };
        return await db.productVariant.create({ data: variantData });
      } else {
        const productData = {
          ...commonProductData,
          id: product.productId,
          variants: {
            create: [
              {
                id: product.variantId,
                ...commonVariantData,
              },
            ],
          },
        };
        console.log(productData);
        return await db.product.create({ data: productData });
      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.stack);
        console.log("Failed to create content interaction:", error);
      }
      console.log("Failed to create content interaction:", error);
      return "error";
    }
  };

  export const getProductMainInfo = async (productId: string) => {
    const product = await db.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        questions: true,
        specs: true,
      },
    });
    if (!product) return null;
    
    // Return the main information of the product
  //   return {
  //     productId: product.id,
  //     name: product.name,
  //     description: product.description,
  //     brand: product.brand,
  //     categoryid: product.categoryId,
  //     subCategoryId: product.subCategoryId,
  //     storeId: product.storeId,
  //   };
  // };
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId,
    offerTagId: product.offerTagId || undefined,
    storeId: product.storeId,
    shippingFeeMethod: product.shippingFeeMethod,
    questions: product.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    })),
    product_specs: product.specs.map((spec) => ({
      name: spec.name,
      value: spec.value,
    })),
  };
};

export const getAllStoreProducts = async (storeUrl: string) => {
  console.log('storeUrl', storeUrl);
  // Retrieve store details from the database using the store URL
  const store = await db.store.findUnique({ where: { url: storeUrl } });
  if (!store) throw new Error("Please provide a valid store URL.");

  // Retrieve all products associated with the store
  const products = await db.product.findMany({
    where : {
      storeId: store.id,
    },
    include: {
      category: true,
      subCategory: true,
      variants: {
        include:{
          images: true,
          colors: true,
          sizes: true,
        },
      },
      store: {
        select: {
          id: true,
          url: true, 
        }
      }
    }
  })

  return products;
};


export const deleteProduct = async (productId: string) => {
  const user = await currentUser();
 
  if (user?.privateMetadata.role !== "SELLER")
      throw new Error(
    "Unauthorized Access: Seller Privileges Required for Entry.");

    //Ensure product data is provided
    if (!productId) throw new Error("Please provide product id.");

    // Delete product from the database
    const response = await db.product.delete({ where: { id: productId }});
    return response;
};

export const getProducts = async (
  filters : any = {},
  sortBy = "",
  page: number = 1,
  pageSize: number = 10
) => {
  console.log("filters ", filters);
    //Default values for page and pageSize
    const currentPage = page;
    const limit = pageSize;
    const skip = (currentPage - 1) * limit;

    // Construct the base
    const whereClause: any = {
      AND : [],
    };

    // Apply catgory filter (using store URL)
    if (filters.store) {
      const store = await db.store.findUnique({
        where: {
          url: filters.store,
        },
        select: {id: true},
      });
      if (store) {
        whereClause.AND.push({ storeId: store.id });
      }
    }

    // Apply catgory filter (using category URL)
    if (filters.category) {
      const category = await db.category.findUnique({
        where: {
          url: filters.category,
        },
        select: {id: true},
      });
      if (category) {
        whereClause.AND.push({ categoryId: category.id });
      }
    }
    
     // Apply subCatgory filter (using category URL)
     if (filters.subCategory) {
      const subCategory = await db.subCategory.findUnique({
        where: {
          url: filters.subCategory,
        },
        select: {id: true},
      });
      if (subCategory) {
        whereClause.AND.push({ subCategoryId: subCategory.id });
      }
    }

    // Get all filtered, sorted products
    const products = await db.product.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      include: {
        variants: {
          include: {
            sizes: true,
            images: true,
            colors: true,
          },
        },
      },
    });

    // Retrieve products matching the filters
    /*
    const totalCount = await db.product.count({
    where: whereClause,
    });
    */

    // Transform the products with filtered variants into ProductCardType structure
    const productWithFilteredVariants = products.map(( product ) => {
      // Filter the variants based on the filters
      const filteredVariants = product.variants;

      // Transform the filtered variants into the VariantSimplified structure
      const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
        variantId: variant.id,
        variantSlug: variant.slug,
        variantName: variant.variantName,
        images: variant.images,
        sizes: variant.sizes,
      }));

      // Extract variant images for the product
      const variantImages: VariantImageType[] = filteredVariants.map((variant) => ({
        url: `/product/${product.slug}/${variant.slug}`,
        image: variant.variantImage
          ? variant.variantImage
          : variant.images[0].url,
      }));

      // Return the product in the ProductCardType structure
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        rating: product.rating,
        sales: product.sales,
        variants,
        variantImages,
      };
    });

   const totalCount = products.length;

   // Caculate total pages
   const totalPages = Math.ceil(totalCount / pageSize);

   // Return the paginated data along with metadata
   return {
    products : productWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
   };
};

export const getProductPageData = async (
  productSlug: string,
  variantSlug: string
) => {
  // Get current user
  const user = await currentUser();

  // Retrieve product variant details from the database
  const product = await retrieveProductDetails(productSlug, variantSlug);
  if (!product) return;

  const userCountry = await getUserCountry();
  //console.log("userCountry in getProductPageData", userCountry);

  const productId = product.id;
  const storeId = product.storeId;
  const [
    productShippingDetails,
    storeFollowersCount,
    isUserFollowingStore,
    ratingStatistics,
  ] = await Promise.all([
    getShippingDetails(
      product.shippingFeeMethod,
      userCountry,
      product.store,
      product.freeShipping
    ),
    getStoreFollowersCount(storeId), // Store followers count
    user ? checkIfUserFollowingStore(storeId, user.id) : false, // User follow status
    getRatingStatistics(productId), // Product rating statistics
  ]);
  
  //const storeFollowersCount = await getStoreFollowersCount(product.storeId);

  // Check if user is following store
  //const isUserFollowIngStore = await checkIfUserFollowingStore(product.storeId, user?.id);

  await getRatingStatistics(product.id);
  return formatProductResponse(product, productShippingDetails, storeFollowersCount, isUserFollowingStore, ratingStatistics);
};

export const checkIfUserFollowingStore = async (
storeId: string,
userId: string | undefined
) => {
let isUserFollowingStore = false;
if (userId) {
  const storeFollowersInfo = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      followers: {
        where: {
          id: userId, // Check if this user is following the store
        },
        select: { id: true }, // Select the user id if following
      },
    },
  });
  if (storeFollowersInfo && storeFollowersInfo.followers.length > 0) {
    isUserFollowingStore = true;
  }
}

return isUserFollowingStore;
};

const getUserCountry = async () => {
  console.log("getUserCountry entered");
  // const userCountryCookie = getCookie("userCountry", { cookies }) || "";
  const defaultCountry = { name: "United States", code: "US" };
  const cookieStore = await cookies()
  const userCountryCookie =cookieStore.get("userCountry");
  console.log("userCountryCookie is ",userCountryCookie);
  //console.log("userCountrycookie is",userCountryCookie?.value);
  // console.log("theme is ",cookieStore.get("userCountry").map((cookie) => {console.log(cookie.name)}));
  
  try {
    const parsedCountry = JSON.parse(userCountryCookie.value);
    
    if (
      parsedCountry &&
      typeof parsedCountry === "object" &&
      "name" in parsedCountry &&
      "code" in parsedCountry
    ) {
      console.log("parsedCountry is",parsedCountry);
      return parsedCountry;
    }
    return defaultCountry;
  } catch (error) {
    console.error("Failed to parse usercountryCookie", error);
  }
};

// Helper functions
export const retrieveProductDetails = async (
  productSlug: string,
  variantSlug: string
) => {
  const product = await db.product.findUnique({
    where: {
      slug: productSlug,
    },
    include : {
      category: true,
      subCategory: true,
      offerTag: true,
      store: true,
      specs: true,
      questions: true,
      reviews: {
        include: {
          images: true,
          user: true,
        },
      },
      freeShipping:{
        include:{
           eligibaleCountries:true 
        },
      },
      variants: {
        where: {
          slug: variantSlug,
        },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        }
      },
    },
  });

  if (!product) return null;
  // Get variant images
  const variantImages = await db.productVariant.findMany({
    where: {
      productId: product.id,
    },
    select : {
      slug: true,
      variantImage: true,
    },
  });
  // console.log("variantImages", variantImages);
    
  return {
    ...product,
    variantImages: variantImages.map((v) => ({
      url: `/product/${productSlug}/${v.slug}`,
      img: v.variantImage,
      slug: v.slug,
    })),
  }
};

const getStoreFollowersCount = async (storeId: string) => {
  const storeFollwersCount = await db.store.findUnique({
    where: {
      id: storeId,
    },
    select: {
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });
  return storeFollwersCount?._count.followers || 0;
};

const formatProductResponse=(product: ProductPageType, shippingDetails:productShippingDetailsType, storeFollowersCount: number, isUserFollowIngStore: boolean,
  ratingStatistics: RatingStatisticsType
)=>{
  if (!product) return;
  const variant = product.variants[0];
  const { store, category, subCategory, questions, offerTag, reviews } = product;
  const { images, colors, sizes } = variant;
 
  return {
    productId: product?.id,
    variantId: variant.id,
    productSlug: product?.slug,
    variantSlug: variant.slug,
    name: product?.name,
    description: product?.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images,
    category,
    subCategory,
    offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    brand: product.brand,
    sku: variant.sku,
    weight: variant.weight,
    variantImage: variant.variantImage,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followerCount: storeFollowersCount,
      isUserFollowIngStore,
    },
    colors,
    sizes,
    specs: {
      product: product.specs,
      variant: variant.specs,
    },
    questions,
    rating: product.rating,
    reviews,
    reviewStatistics:ratingStatistics,
    shippingDetails,
    relatedProducts: [],
    variantImages: product.variantImages,
  };
};

export const getShippingDetails=async(
  shippingFeeMethod: string,
  userCountry: { name: string; code: string; city: string},
  store: Store,
  freeShipping: FreeShippingWithCountriesType | null
)=>{
  console.log("userCountry is ", userCountry.name);
  const country = await db.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  });

  if (country) {
    // Retrieve shipping rate for the country
    const shippingRate = await db.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    });
    let shippingDetails = {
      shippingFeeMethod,
      shippingService: "",
      shippingFee: 0,
      extraShppingFee: 0,
      deliveryTimeMin:0,
      deliveryTimeMax:0,
      returnPolicy:"",
      countryCode: userCountry.code,
      countryName: userCountry.name,
      city: userCountry.city,
      isFreeShipping:false,
      extraShippingFee:0,
    
    };

    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService;
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
    const shippingFeeForAdditionalItem =
      shippingRate?.shippingFeeForAdditionalItem ||
      store.defaultShippingFeeForAdditionalItem;
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;
    const extraShippingFee = 0;
   // Check for free shipping
   if (freeShipping) {
    const free_shipping_countries = freeShipping.eligibaleCountries;
    const check_free_shipping = free_shipping_countries.find((c)=>c.countryId===country.id);
    if(check_free_shipping){
       shippingDetails.isFreeShipping  = true;
    }
   }
   shippingDetails = {
    shippingFeeMethod,
    shippingService: shippingService,
    shippingFee: 0,
    extraShppingFee: 0,
    deliveryTimeMin,
    deliveryTimeMax,
    returnPolicy,
    countryCode: userCountry.code,
    countryName: userCountry.name,
    city: userCountry.city,
    isFreeShipping: shippingDetails.isFreeShipping,
    extraShippingFee:0,
    
  };

  const { isFreeShipping } = shippingDetails;
  switch (shippingFeeMethod) {
    case "ITEM":
      shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerItem;
      shippingDetails.extraShppingFee = shippingFeeForAdditionalItem;
      break;

    case "WEIGHT":
      shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeePerKg;
      break;

    case "FIXED":
      shippingDetails.shippingFee = isFreeShipping ? 0 : shippingFeeFixed;
      break;

    default:
      break;
  }
  return shippingDetails;
   
 }
 return false;
};

export const getRatingStatistics = async (productId: string) => {
  const ratingStats = await db.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: {
      rating: true,
    },
  });
  const totalReviews = ratingStats.reduce(
    (sum, stat) => sum + stat._count.rating,
    0
  );

const ratingCounts = Array(5).fill(0);

ratingStats.forEach((stat) => {
  let rating = Math.floor(stat.rating);
  if (rating >= 1 && rating <= 5) {
    ratingCounts[rating - 1] = stat._count.rating;
  }
});

return {
  ratingStatistics: ratingCounts.map((count, index) => ({
    rating: index + 1,
    numReviews: count,
    percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
  })),
  reviewsWithImagesCount: await db.review.count({
    where: {
      productId,
      images: { some: {} },
    },
  }),
  totalReviews,
};
};
