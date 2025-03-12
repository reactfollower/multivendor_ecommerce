"use server"

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server"

import { Store } from "@prisma/client";

 
export const upsertStore = async (store: Store) => {

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
      console.log('store', store);
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
