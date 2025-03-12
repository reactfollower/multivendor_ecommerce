"use client"

import { CategoryFormSchema } from "@/lib/schemas";
import { Category } from "@prisma/client";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form handling utilities
import * as z from "zod";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ImageUpload from "../shared/image-upload";

// Queries
import { upsertCatetory } from "@/queries/category";

// Utils
import {v4} from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CategoryDetailsProps {
    data?: Category;
  }

const CategoryDetails: FC<CategoryDetailsProps> = ({ 
    data
}) => {
    const {toast} = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof CategoryFormSchema>>({
        mode: "onChange", // Form validation mode
        resolver: zodResolver(CategoryFormSchema), // Resolver for form validation
        defaultValues: {
          // Setting default form values from data (if available)
          name: data?.name || '',
          image: data?.image ? [{ url: data?.image }] : [],
          url: data?.url || '',
          featured: data?.featured,
        },
      });

    const isLoading = form.formState.isSubmitting;

    // Reset form values when data changes
    useEffect(() => {
        if (data) {
          form.reset({
            name: data?.name,
            image: [{ url: data?.image }],
            url: data?.url,
            featured: data?.featured,
          });
        }
      }, [data, form]);

    const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
      try {
        // Upserting category data
        const response = await upsertCatetory({
            id:data?.id ? data?.id : v4(),
            name:values.name,
            image:values.image[0].url,
            url:values.url,
            featured: values.featured,
           createdAt: new Date(),
           updatedAt : new Date(), 
        });
        toast ({
            title: data?.id
            ? "Category has been updated."
            : `Congratulations! '${response?.name}' is now officially created.`,
        });
        if (data?.id) {
            router.refresh();
        } else {
            router.push("/dashboard/admin/categories");
        }
      } catch (error: any) {
        console.log(error); 
        toast ({
            variant: "destructive",
            title: "Oops!",
            description: error.toString(),
        });
      }
    };

    return (
       <AlertDialog>
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>
                    {data?.id
                    ? `Update ${data?.name} category information.`
                    : "Lets create a category. You can edit category later from the categories table or the category page."}
                
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-4"
                >
               <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                                type="profile"
                                value={field.value.map((image) => image.url)}
                                disabled={isLoading}
                                onChange={(url) => field.onChange([{ url }])}
                                onRemove={(url) => field.onChange([
                                    ...field.value.filter(
                                        (current) => current.url !== url
                                    ),
                                ])}                  
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                // disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category url</FormLabel>
                    <FormControl>
                      <Input placeholder="/category-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        // @ts-ignore
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This Category will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                 ? "loading..."
                 :data?.id
                 ?"Save category information"
                 :"Create category"}
              </Button>
           </form>
         </Form>
        </CardContent>
      </Card>
   </AlertDialog>
);
};

export default CategoryDetails;