"use client";
import ColorWheel from "@/components/shared/color-wheel";
import { ReivewWithImageType } from "@/lib/types";
import Image from "next/image";
import ReactStars from "react-rating-stars-component";

export default function ReviewCard({
    review,
}: {
    review: ReviewWithImageType;
}) {
    const {images, user} = review;
    const colors = review.color
    .split(",")
    .filter((color) => color.trim() !== "") // Remove any empty strings
    .map((color) => ({ name: color.trim() }));

    const {name} = user;
    const cesnoredName = `${name[0]}***${name[user.name.length -1]}`;
    return (
        <div className="border border-[#d8d8d8] roudned-xl flex h-fit relative px-4 px-2.5">
            <div className="w-16 px- space-y-1">
                <Image 
                  src={user.picture}
                  alt="Profile image"
                  width={100}
                  height={100}
                  className="w-11 h-11 roudned-full object-cover"
                />
                <span className="text-xs text-main-secondary">{cesnoredName}</span>  
            </div>
            <div className="flex flex-1 flex-col justify-between leading-5 overflow-hidden px-1.5">
            <div className="space-y-2">
            <ReactStars
                count={5}
                size={24}
                color="#F5F5F5"
                activeColor="#FFD804"
                value={review.rating}
                isHalf
                edit={false}
          />
          <div className="flex items-center gap-x-2">
            <ColorWheel colors={colors} size={24} />
            <div className="text-main-secondary text-sm">{review.variant}</div>
            <span>.</span>
            <div className="text-main-secondary text-sm">{review.size}</div>
            <span>.</span>
            <div className="text-main-secondary text-sm">
                {review.quantity} PC
            </div>
            </div>
            <p className="text-sm">{review.review}</p>
            {images.length>0 && (
                <div className="flex flex-wrap gap-2">
                    {images.map((img) => (
                        <div key={img.id} className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer">
                            <Image
                              src={img.url}
                              alt={img.alt}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                              />
                        </div>
                    ))}
                </div>
                
            )}
          </div>
            </div>
            <div className="border border-[#d8d8d8] roudned-xl flex h-full relative py-4 px-2">
                 
            </div>
        </div>
    );
}
