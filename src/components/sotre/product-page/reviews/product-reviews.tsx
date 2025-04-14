"use client";
import { RatingStatisticsType, ReivewWithImageType } from "@/lib/types";
import { FC, useState } from "react";
import RatingCard from "../../cards/product-rating";
import RatingStatisticsCard from "../../cards/rating-statistics";
import ReviewCard from "../../cards/review";

interface Props {
    productId: string;
    rating: number;
    statistics: RatingStatisticsType;
    reviews: ReivewWithImageType[];
}

const ProductReviews: FC<Props> = ({ productId, rating, statistics, reviews }) => {
    const [data, setData] = useState<ReivewWithImageType[]>(reviews);
    const {totalReviews, ratingStatistics } = statistics;
    return (
        <div id="reviews" className="pt-6">
            {/*Title*/}
            <div className="h-12">
                <h2 className="text-main-primary text-2x1 font-bold">
                    Custom Reviews({totalReviews})
                    </h2>
            </div>
            {/**Sattistics */}
            <div className="w-full">
                <div className="flex items-center gap-4">
                    <RatingCard rating={rating} />
                    <RatingStatisticsCard statistics = {ratingStatistics} />
                </div>
            </div>
            {totalReviews > 0 && (
                <>
                  <div className="space-y-6">
                    {/** Review filters */}
                    {/** Review sort */}
                  </div>
                  {/** Reivews */}
                  <div className="mt-10 min-h-72 grid grid-cols-2 gap-6">
                    {
                        data.length>0 ? (
                            <>
                              {data.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                              ))}
                            </>
                        ) : (
                            <>No Reviews.</>
                        )
                    }
                  </div>
                  {/** Pagination */}
                </>
            )

            }
            {/* Review filters */}
            {/* Review filters */}

        </div>
    );
};

export default ProductReviews;
