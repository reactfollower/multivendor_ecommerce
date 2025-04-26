"use server";

import { db } from "@/lib/db";
import { ReviewDetailsType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";

export const upsertReview = async (
    productId: string,
    review: ReviewDetailsType
) => {
    try {
        // Get current user
        const user = await currentUser();

        // Ensure user is authenticasted
        if (!user) throw Error("Unauthenticated.");
        if(!productId ) throw new Error("Product ID is required.");
        if (!review) throw new Error("Please provide review data.");

        // Upsert review into the database
        const reviewDetails = await db.review.upsert({
            where: {
                id: review.id,
            },
            update: {
                ...review,
                images: {
                    deleteMany: {},
                    create: review.images.map((img) => ({
                        url: img.url,
                    })),
                },
                userId: user.id,
            },
            create: {
                ...review,
                images: {
                    create: review.images.map((img) => ({
                        url: img.url,
                    })),
                },
                productId,
                userId: user.id,
            },
            include: {
                images: true,
                user: true,
            }

        });

        // Calculate the new average rating
        const productReviews = await db.review.findMany({
            where: {
                productId,
            },
            select: {
                rating: true,
            },
        });

        const totalRating = productReviews.reduce(
            (accd, rev) => ac + rev.rating,
            0
        );

        const averageRating = totalRating / productReviews.length;

        // update the product rating
        const updateProduct = await db.product.update({
            where: {
                id: productId,
            },
            data: {
                rating: averageRating,
                numReviews: productReviews.length,
            },
        });
        return reviewDetails;
    } catch (error) {
            // Log and re-throw any errors
            console.log(error);
            throw error;
        }
    };
