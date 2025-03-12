"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";
import {db} from "@/lib/db";

// Prisma model
import { Category, SubCategory } from "@prisma/client";
import { CategoriesIcon } from "@/components/dashboard/icons";

export const upsertSubCatetory=async(subCategory: SubCategory)=> {
    try {
        const user = await currentUser();

    if(!user) throw new Error("Unauthenticated.");
    
    //Verify admin permission
    if(user.privateMetadata.role!=="ADMIN") throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
    );

    if(!subCategory) throw new Error("Please provide subcategory data.");

    const existingSubCategory = await db.subCategory.findFirst({
        where : {
            AND :[
            {
               OR: [ {name:subCategory.name}, {url: subCategory.url } ],
            },
            {
                NOT: {
                    id: subCategory.id,
                },
            },
        ],

        },
    });
    if (existingSubCategory) {
        let errorMessage = "";
        if (existingSubCategory.name === subCategory.name) {
            errorMessage = "A category with the same name already exists";

        } else if(existingSubCategory.url === subCategory.url){
            errorMessage="A category with the same URL already exists";
        }
        throw new Error(errorMessage);
    }

    // Upsert category into the database
    const subCategoryDetails = await db.subCategory.upsert({
        where: {
            id: subCategory.id,
        },
        update: subCategory,
        create: subCategory,
    });
    return subCategoryDetails;
    } catch (error) {
        console.log(error);
    }
};

export const getAllSubCategories = async () => {
  const subCategories = await db.subCategory.findMany({
    include : {
        category: true,
    },
  orderBy: {
    updatedAt: "desc",
 },
});
return subCategories;
}; 

export const getSubCategory = async (subCategoryId: string) => {
    if (!subCategoryId) throw new Error("Please provide subCategory ID.");
    
    const subCategory = await db.subCategory.findUnique({
        where: {
            id: subCategoryId,
        },
    });
    return subCategory;
}

export const deleteSubCategory = async (subCategoryId: string) => {
    const user = await currentUser();

    if (!user) throw new Error("Unauthenticated.");

    if (user.privateMetadata.role !== "ADMIN")
        throw new Error(
         "Unauthorized Access: Admin Privileges Required for Entry."
    );

    // Ensure subCategory ID is provided
    if (!subCategoryId) throw new Error("Please provide category ID.");

    const response = await db.subCategory.delete({
        where: {
            id: subCategoryId,
        },
    });
    return response;
}
   