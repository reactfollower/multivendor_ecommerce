"use client";
import { ProductVariantDataType, RatingStatisticsType, ReivewWithImageType, ReviewsFiltersType, ReviewsOrderType } from "@/lib/types";
import { FC, useEffect, useState } from "react";
import RatingCard from "../../cards/product-rating";
import RatingStatisticsCard from "../../cards/rating-statistics";
import ReviewCard from "../../cards/review";
import { getProductFilteredReviews } from "@/queries/product";
import ReviewsFilters from "./filters";
import ReviewsSort from "./sort";
import Paginaion from "../../shared/pagination";
import ReviewDetails from "../../forms/review-details";

interface Props {
    productId: string;
    rating: number;
    statistics: RatingStatisticsType;
    variantsInfo: ProductVariantDataType[];
    reviews: ReivewWithImageType[];
}

const ProductReviews: FC<Props> = ({ productId, rating, statistics, variantsInfo, reviews, }) => {
    const [data, setData] = useState<ReivewWithImageType[]>(reviews);
    const {totalReviews, ratingStatistics } = statistics;
    const half = Math.ceil(data.length / 2);

    const filtered_data = {
        rating: undefined,
        hasImages: undefined,
    }
    const [filters, setFilters] = useState<ReviewsFiltersType>(filtered_data);
    const [sort, setSort] = useState<ReviewsOrderType>();

    const [page,setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(2);

    const handleGetReviews = async()=> {
        const res=await getProductFilteredReviews(productId, filters, sort,page, pageSize);
        setData(res);
    }

    useEffect(() => {
        if(filters.rating || filters.hasImages || sort){
            setPage(1);
            handleGetReviews();
        }
        if(page) {
            handleGetReviews();
        }
            
    }, [filters, sort, page]);

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
                    <ReviewsFilters 
                      filters={filters}
                      setFilters={setFilters}
                      setSort={setSort}
                      stats={statistics}
                     /> 
                     <ReviewsSort sort={sort} setSort={setSort} />
                  </div>
                  {/** Reivews */}
                  <div className="mt-6 min-h-72 grid grid-cols-2 gap-4">
                    {
                        data.length>0 ? (
                            <>
                            <div className="flex flex-col gap-3">
                              {data
                                 .slice(0, half)
                                 .map((review) => (
                                <ReviewCard key={review.id} review={review} />
                              ))}
                              </div>
                              <div className="flex flex-col gap-3">
                              {data
                                 .slice(half)
                                 .map((review) => (
                                <ReviewCard key={review.id} review={review} />
                              ))}
                              </div>
                            </>
                        ) : (
                            <>No Reviews.</>
                        )
                    }
                  </div>
             {data.length >= pageSize && (
                <Paginaion
                  page={page}
                  totalPages={
                  filters.rating || filters.hasImages
                    ? data.length / pageSize
                    : 1 / pageSize
                }
                setPage={setPage}
              />
            )}
            </>
            )}
            <div className="mt-3">
              <ReviewDetails
                productId={productId}
                setReviews={setData}
                variantsInfo={variantsInfo}
                reviews={data}
                />
            </div> 

        </div>
    );
};

export default ProductReviews;
