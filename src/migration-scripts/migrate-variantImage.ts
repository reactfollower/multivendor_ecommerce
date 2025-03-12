"use server"

import { db } from "@/lib/db";

export async function updateVariantImage() {
    try {
        // Fetch all product variants that have images
        const variants = await db.productVariant.findMany({
            include: {
                images: true,
            },
        });

        // update each variant with first image URL
        for (const variant of variants) {
            if (variant.images.length > 0) {
                const firstImage = variant.images[0];
                await db.productVariant.update({
                    where: { id: variant.id},
                    data: {
                        variantImage: firstImage.url,
                    },
                });
                console.log(
                    `Updated variant ${variant.id} with image ${firstImage.url}`
                )
            }
        }
        console.log(
            "All product variants have been updated with their first image."
        );
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.stack);
    } 
 }
}
