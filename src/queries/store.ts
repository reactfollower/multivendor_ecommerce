/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { db } from "@/lib/db";
import { CountryWithShippingRatesType, StoreDefaultShippingType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server"

import { ShippingRate, Store } from "@prisma/client";
import { User } from "lucide-react";

 
export const upsertStore = async (store: Partial<Store>) => {

    try {
        // Get current user
        const user = await currentUser();

        if (!user) throw new Error("Unauthenticated.");

        // Verify seller permission
        if (user.privateMetadata.role !== "SELLER")
            throw new Error(
        "Unauthorized Access: Seller Privileges Required for Entry.");
    if (!store) throw new Error("Please provide store data.");

    // Check if store with same name, email, url, or phone number alerady exists
    const existingStore = await db.store.findFirst({
        where: {
            AND: [
                {
                    OR: [
                        { name: store.name },
                        { url: store.url},
                        { email: store.email },
                        { phone: store.phone },
                    ],
                },
                {
                    NOT: {
                        id: store.id,
                    },
                },
            ],
        },
    });
   

    //If a store with same name, email, or phone number aleready exists, throw an error
    if (existingStore) {
        let errorMessage = "";
        if (existingStore.name === store.name) {
          errorMessage = "A store with the same name already exists";
        } else if (existingStore.email === store.email) {
          errorMessage = "A store with the same email already exists";
        } else if (existingStore.phone === store.phone) {
          errorMessage = "A store with the same phone number already exists";
        } else if (existingStore.url === store.url) {
          errorMessage = "A store with the same URL already exists";
        }
        throw new Error(errorMessage);
      }
    //   console.log('store', store);
    // Upsert store details into the database
    
    const storeDetails = await db.store.upsert({
      where: {
        id: store.id,
      },
      update: store,
      create: {
        ...store,
        user: {
          connect: { id: user.id },
        },
      },
    });

    return storeDetails;
  
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getStoreDefaultShippingDetails = async (storeUrl: string) => {
    try {
        if(!storeUrl) throw new Error("Store URL is required.");

        const store = await db.store.findUnique({
            where: {
                url : storeUrl,
            },
            select : {
              defaultShippingService: true,
              defaultShippingFeePerItem: true,
              defaultShippingFeeForAdditionalItem: true,
              defaultShippingFeePerKg: true,
              defaultShippingFeeFixed: true,
              defaultDeliveryTimeMin: true,
              defaultDeliveryTimeMax: true,
              returnPolicy: true,
        },
        });
        if (!store) throw new Error("Store not found.");

        return store;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateStoreDefaultShippingDetails=async(storeUrl:string, details:StoreDefaultShippingType)=>{
    try {
        const user = await currentUser();

        // Ensure user is authenticated
        if (!user) throw new Error("Unauthenticated.");
   
        // Verify seller permission
        if (user.privateMetadata.role !== "SELLER")
           throw new Error(
         "unauthorized Access: Seller Privileges Required for Entry.");
   
        if (!storeUrl) throw new Error("Store URL is required");
   
        if (!details) {
           throw new Error("No shipping details provided to update.");
        }
   
        // Make sure seller is updating their own store
        const check_ownership = await db.store.findUnique({
           where: {
               url: storeUrl,
               userId: user.id,
           },
        });
   
        if(!check_ownership)
           throw new Error("Make sure you have the permissions to upate this store");
   
        // Find and update the store based on storeUrl
        const updatedStore = await db.store.update({
           where: {
               url: storeUrl,
               userId: user.id,
           },
           data: details,
        });
   
        return updatedStore;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getStoreShippingRates = async (
    storeUrl: string
) => {
    try {
        // Get Current user
        const user = await currentUser();

        // Ensure

        if (!user) throw new Error("Unauthenticated.")
        if (user.privateMetadata.role !== "SELLER")
            throw new Error(
                "Unauthorized Access: Seller Privileges Required for Entry."
            );

        if (!storeUrl) throw new Error("Store URL is required.");

        const check_ownership = await db.store.findUnique({
            where: {
                url: storeUrl,
                userId: user.id,
            },
        });

        if (!check_ownership)
            throw new Error(
                "Make sure you have the permissions to update this store"
            );
        
        // Get Store details
        const store = await db.store.findUnique({
            where: { url: storeUrl, userId: user.id },
        });

        if(!store) throw new Error("Store could not be found.");

        // Retrieve all countries
        const countries = await db.country.findMany({
            orderBy: {
                name: "asc"
            },
        });

        // Retrieve all shipping rates for the specified store
        const shippingRates = await db.shippingRate.findMany({
            where: {
                storeId: store.id,
            },
        });

       // Create a map for quick lookup of shipping rates by country ID
       const rateMap = new Map();
       shippingRates.forEach((rate) => {
         rateMap.set(rate.countryId, rate);
       });

       // Map countries to their shipping rates
       const result = countries.map((country) => ({
        countryId: country.id,
        countryName: country.name,
        shippingRate: rateMap.get(country.id) || null,
      }));
       return result;

      } catch (error) {
            console.log(error);
            throw error;
        }
    };
    
    // Function: upsertShippingRate
// Description: Upserts a shipping rate for a specific country, updating if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - storeUrl: Url of the store you are trying to update.
//   - shippingRate: ShippingRate object containing the details of the shipping rate to be upserted.
// Returns: Updated or newly created shipping rate details.

export const upsertShippingRate = async (
    storeUrl: string,
    shippingRate: ShippingRate
  ) => {
    try {
      // Get current user
      const user = await currentUser();
  
      // Ensure user is authenticated
      if (!user) throw new Error("Unauthenticated.");
  
      // Verify seller permission
      if (user.privateMetadata.role !== "SELLER")
        throw new Error(
          "Unauthorized Access: Seller Privileges Required for Entry."
        );
  
      // Make sure seller is updating their own store
      const check_ownership = await db.store.findUnique({
        where: {
          url: storeUrl,
          userId: user.id,
        },
      });
  
      if (!check_ownership)
        throw new Error(
          "Make sure you have the permissions to update this store"
        );
  
      // Ensure shipping rate data is provided
      if (!shippingRate) throw new Error("Please provide shipping rate data.");
  
      // Ensure countryId is provided
      if (!shippingRate.countryId)
        throw new Error("Please provide a valid country ID.");
  
      // Get store id
      const store = await db.store.findUnique({
        where: {
          url: storeUrl,
          userId: user.id,
        },
      });
      if (!store) throw new Error("Please provide a valid store URL.");
  
      // Upsert the shipping rate into the database
      const shippingRateDetails = await db.shippingRate.upsert({
        where: {
          id: shippingRate.id,
        },
        update: { ...shippingRate, storeId: store.id },
        create: { ...shippingRate, storeId: store.id },
      });
  
      return shippingRateDetails;
    } catch (error) {
      // Log and re-throw any errors
      throw error;
    }
  };
  