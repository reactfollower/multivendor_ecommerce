"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";
import {db} from "@/lib/db";

// Prisma model
import { Category } from "@prisma/client";
import { CategoriesIcon } from "@/components/dashboard/icons";

export const upsertCatetory=async(category: Category)=> {
    try {
        const user = await currentUser();

    if(!user) throw new Error("Unauthenticated.");
    
    //Verify admin permission
    if(user.privateMetadata.role!=="ADMIN") throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
    );

    if(!category) throw new Error("Please provide category data.");

    const existingCategory = await db.category.findFirst({
        where : {
            AND :[
            {
               OR: [ {name:category.name}, {url: category.url } ],
            },
            {
                NOT: {
                    id: category.id,
                },
            },
        ],

        },
    });
    if (existingCategory) {
        let errorMessage = "";
        if (existingCategory.name === category.name) {
            errorMessage = "A category with the same name already exists";

        } else if(existingCategory.url === category.url){
            errorMessage="A category with the same URL already exists";
        }
        throw new Error(errorMessage);
    }

    // Upsert category into the database
    const categoryDetails = await db.category.upsert({
        where: {
            id: category.id,
        },
        update: category,
        create: category,
    });
    return categoryDetails;
    } catch (error) {
        console.log(error);
    }
};

export const getAllCategories=async()=> {
  const categories = await db.category.findMany({
  orderBy: {
    updatedAt: "desc",
 },
});
return categories;
}; 

export const getCategory = async (categoryId: string) => {
    if (!categoryId) throw new Error("Please provide category ID.");
    
    const category = await db.category.findUnique({
        where: {
            id: categoryId,
        },
    });
    return category;
}

export const deleteCategory = async (categoryId: string) => {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
        throw new Error(
         "Unauthorized Access: Admin Privileges Required for Entry."
    );

    // Ensure category ID is provided
    if (!categoryId) throw new Error("Please provide category ID.");

    const response = await db.category.delete({
        where: {
            id: categoryId,
        },
    });
    return response;
}

// Function: getAllCategoriesForCategory
// Description: Retrieves all SubCategories from a category from the database.
// Permission Level: Public
// Returns: Array of SubCategories of category sorted by updatedAt date in descending order.
export const getAllCategoriesForCategory = async (categoryId: string) => {
    // Retrieve all subcategories of category from the database
    const subCategories = await db.subCategory.findMany({
      where: {
        categoryId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return subCategories;
  };
  