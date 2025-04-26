import { RatingStatisticsType, ReviewsOrderType,ReviewsFiltersType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dispatch, FC, SetStateAction } from "react";

interface Props {
    filters: ReviewsFiltersType;
    setFilters: Dispatch<SetStateAction<ReviewsFiltersType>>;
    stats: RatingStatisticsType;
    setSort: Dispatch<SetStateAction<ReviewsOrderType | undefined>>;
    
}

const ReviewsFilters: FC<Props> = ({
    filters,
    setFilters,
    stats,
    setSort,
    
}) => {
    const {rating, hasImages } = filters;
    const { ratingStatistics, reviewsWithImagesCount, totalReviews } = stats;
    return (
        <div className="mt-8 relative overflow-hidden">
            <div className="flex flex-wrap gap-4">
                {/* All */}
            {ratingStatistics.map((r) => (
            <div 
              key={r.rating} 
            className={cn("bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4",
            {
                "bg-[#ffebed] text=[#fd384f] border-[#fd384f]": 
                  r.rating === rating,
            }
            )}
            onClick={() => 
                setFilters({ ...filters, rating: r.rating })
            }  
            >
              {r.rating} stars ({r.numReviews})
            </div>
            ))}
        </div>
      </div>
    );
};

export default ReviewsFilters;
