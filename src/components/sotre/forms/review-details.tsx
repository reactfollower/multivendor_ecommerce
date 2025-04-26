"use client";
import toast from "react-hot-toast";
import { AddReviewSchema } from "@/lib/schemas";
import { ReivewWithImageType, ReviewDetailsType, VariantInfoType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Form ,FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import ReactStars from "react-rating-stars-component";
import { z } from "zod";
import { useForm } from "react-hook-form";
import Select from "../ui/select";
import Input from "../ui/input";
import { Button } from "../ui/button";
import { PulseLoader } from "react-spinners";
import ImagesPreviewGrid from "@/components/dashboard/shared/images-preview-grid";
import { Images } from "lucide-react";
import ImageUpload from "@/components/dashboard/shared/image-upload";
import ImageUploadStore from "../shared/upload-images";
import { upsertReview } from "@/queries/reviews";
import { v4 } from "uuid";

export default function ReviewDetails({
    productId,
    data,
    variantsInfo,
    setReviews,
    reviews,
}: {
    productId: string;
    data?: ReviewDetailsType[];
    variantsInfo: VariantInfoType[];
    reviews:ReivewWithImageType[];
    setReviews: Dispatch<SetStateAction<ReivewWithImageType[]>>;
}) {
    console.log("variantsInfo",variantsInfo);
    // State for selected Variant
    const [activeVariant, setActiveVariant ] = useState<VariantInfoType>(
          variantsInfo[0]
    );

    // State for sizes
    const [sizes, setSizes] = useState<{ name: string; value: string}[]>([]);
     // Temporary state for images
    const [images, setImages] = useState<{ url: string }[]>([]);

    const form = useForm<z.infer<typeof AddReviewSchema>>({
        mode: "onChange",
        resolver: zodResolver(AddReviewSchema),
        defaultValues: {
            // Setting default form values data (if available)
            variantName: data?.variant || activeVariant.variantName,
            rating: data?.rating || 0,
            size: data?.size || "",
            review: data?.review || "",
            quantity: data?.quantity || undefined,
            images: data?.images || [],
            color: data?.color || "",
        },
    });

    // Loading status based on form submission
    const isLoading = form.formState.isSubmitting;

    
     // Errors
  const errors = form.formState.errors;

    // Submit handler for form submission

    const handleSubmit = async (values: z.infer<typeof AddReviewSchema>) => {
        try {
            const response = await upsertReview(productId, {
                id: data?.id || v4(),
                variant: values.variantName,
                images: values.images,
                quantity: values.quantity,
                rating: 3,
                review: values.review,
                size: values.size,
                color: "yellow",
            });
        if (response.id){
            const rev = reviews.filter((rev) => rev.id != response.id);
            setReviews([...rev, response]);
        }
            toast.success("Review Addes Successfully");
        } catch (error) {
            // Handling from submission errors
            console.log(error);
            toast.error(error.toString());
        }
    };

    const variants = variantsInfo.map((v) => ({
        name: v.variantName,
        value: v.variantName,
        image: v.variantImage,
        // colors: v.colors.map((c) => c.name).join(","),
        colors: v.colors,
      }));
    

    useEffect(() => {
        form.setValue("size", "");
        const name=form.getValues().variantName;
        const variant = variantsInfo.find((v)=>v.variantName === name);
        if(variant){
            const sizes_data = variant.sizes.map((s) => ({
                name: s.size,
                value: s.size,
            }));
            setActiveVariant(variant);
            if (sizes) setSizes(sizes_data);
            form.setValue("color" , variant.colors);
        }
    },[form.getValues().variantName]);
    return (
        <div>
            <div className="p-4 bg-[#f5f5f5] roudned-xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="flex flex-col space-y-4">
                           {/* Title */ }                            
                           <div className="pt-4">
                              <h1 className="font-bold text-2xl">Add a review</h1>
                           </div>
                           {/* Form items */}
                           <div className="flex flex-col gap-3">
                           <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <div className="flex items-center gap-x-2">
                                        <ReactStars
                                            count={5}
                                            size={40}
                                            color="#e2dfdf"
                                            activeColor="#FFD804"
                                            value={field.value}
                                            onChange={field.onChange}
                                            isHalf
                                            edit={true}
                                        />
                                        <span>
                                          ( {form.getValues().rating.toFixed(1)} out of 5.0)
                                        </span>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            </div>
                            <div className="w-full flex flex-wrap gap-x-4">
                                    <div className="w-full sm:w-fit">
                                        <FormField
                                        control={form.control}
                                        name="variantName"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormControl>
                                                <Select
                                                name={field.name}
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={variants}
                                                placeholder="Select product"
                                                subPlaceholder="Please select a product"
                                                />
                                            </FormControl>
                                            </FormItem>
                                        )}
                                        />
                                        </div>
                                        <FormField
                                                control={form.control}
                                                name="size"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                    <Select
                                                        name={field.name}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={sizes}
                                                        placeholder="Select size"
                                                        subPlaceholder="Please select a size"
                                                    />
                                                    </FormControl>
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                 control={form.control}
                                                 name="quantity"
                                                 render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                      <FormControl>
                                                       <Input
                                                        name="quantity"
                                                        type="number"
                                                        placeholder="Quantity (Optional)"
                                                   onChange={ (value) => { field.onChange(value.toString() );}}                                             
                                                    value={field.value ? field.value.toString() : ""} // Handle undefined gracefully
                                                    />
                                                   </FormControl>
                                                 </FormItem>
                                                )}
                                             />
                                          </div>
                                          <FormField
                                            control={form.control}
                                            name="review"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormControl>
                                                    <textarea
                                                    className="min-h-32 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                                                    placeholder="Write your review..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                </FormItem>
                                            )}
                                            />
                                             <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem className="w-full xl:border-r">
                                                <FormControl>
                                                    <ImageUploadStore
                                                    value={field.value.map((image) => image.url)}
                                                    // disabled={isLoading}
                                                    onChange={(url) => {
                                                                        setImages((prevImages) => {
                                                        const updatedImages = [...prevImages, { url }];
                                                        if (updatedImages.length <= 3) {
                                                            field.onChange(updatedImages);
                                                            return updatedImages;
                                                        } else {
                                                            return prevImages;
                                                        }
                                                        });
                                                    }}
                                                    onRemove={(url) =>
                                                        field.onChange([
                                                        ...field.value.filter(
                                                            (current) => current.url !== url
                                                        ),
                                                        ])
                                                    }
                                                    maxImages={3}
                                                    />
                                                </FormControl>
                                                </FormItem>
                                            )}
                                            />
                                        </div>

                                       <div className="space-y-2 text-destructive">
                                        {/* {errors.rating && <p>{errors.rating.message}</p>} */}
                                        {errors.size && <p>{errors.size.message}</p>}
                                        {errors.review && <p>{errors.review.message}</p>}
                                    </div>
                                    <div className="w-full flex justify-end">
                                        <Button type="submit" className="w-36 h-12">
                                        {isLoading ? (
                                            <PulseLoader size={5} color="#fff" />
                                        ) : (
                                            "Submit Review"
                                        )}
                                        </Button>
                                    </div>
                                    
                             </form>
                    </Form>
                </div>
            </div>
    );
};
