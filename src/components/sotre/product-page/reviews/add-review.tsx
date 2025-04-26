"use client";
import { ReviewWithImageType, VariantInfoType } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";
import ReviewDetails from "../../forms/review-details";

export default function AddReview({
    productId,
    reivews,
    variantsInfo,
} : {
    productId: string;
    reviews: ReviewWithImageType[];
    variantsInfo: VariantInfoType[];
}) {
    const [reviews_data, setReviewsData] = useState<ReviewWithImageType[]>(reivews);
    return (
        <div>
            <ReviewDetails productId={productId} variantsInfo={variantsInfo} setReviews={setReviewsData}/>
        </div>
    );
};
