"use server";

// DB
import { db } from "@/lib/db";

// Types
import {
  ProductWithVariantType,
} from "@/lib/types";
import { ProductVariant, Size, Store } from "@prisma/client";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Slugify
import slugify from "slugify";

// import slugify from "slugify";
import { generateUniqueSlug } from "@/lib/utils";

// Cookies
// import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { setMaxListeners } from "events";
import { Description } from "@radix-ui/react-toast";

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
        keywords: product.keywords.join(","),
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
          // variants: {
          //   create: [
          //     {
          //       id: product.variantId,
          //       ...commonVariantData,
          //     },
          //   ],
          // },
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
    });
    if (!product) return null;
    
    // Return the main information of the product
    return {
      productId: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      categoryid: product.categoryId,
      subCategoryId: product.subCategoryId,
      storeId: product.storeId,
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
