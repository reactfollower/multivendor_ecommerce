"use client"

import { StoreShippingFormSchema } from "@/lib/schemas";
import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form handling utilities
import * as z from "zod";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@tremor/react";

// Queries
import { updateStoreDefaultShippingDetails } from "@/queries/store";

// Utils
import {v4} from "uuid";
import { useToast } from "@/hooks/use-toast";
import { StoreDefaultShippingType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

interface StoreDefaultShippingDetailsProps {
    data?: StoreDefaultShippingType;
    storeUrl: string;
  }

const StoreDefaultShippingDetails: FC<StoreDefaultShippingDetailsProps> = ({ 
    data,
    storeUrl,
}) => {
    const {toast} = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof StoreShippingFormSchema>>({
        mode: "onChange", // Form validation mode
        resolver: zodResolver(StoreShippingFormSchema), // Resolver for form validation
        defaultValues: {
          // Setting default form values from data (if available)
          defaultShippingService: data?.defaultShippingService || "",
          defaultShippingFeePerItem: data?.defaultShippingFeePerItem,
          defaultShippingFeeForAdditionalItem: data?.defaultShippingFeeForAdditionalItem,
          defaultShippingFeePerKg: data?.defaultShippingFeePerKg,
          defaultShippingFeeFixed: data?.defaultShippingFeeFixed,
          defaultDeliveryTimeMin: data?.defaultDeliveryTimeMin,
          defaultDeliveryTimeMax: data?.defaultDeliveryTimeMax, 
          returnPolicy: data?.returnPolicy,
        },
      });

    const isLoading = form.formState.isSubmitting;

    // Reset form values when data changes
    useEffect(() => {
        if (data) {
          form.reset(data);
        }
      }, [data, form]);

      const handleSubmit1 = async (error: any) => {
        alert('1');
        console.log(error);
        console.log(error.stack);
      }

    const handleSubmit = async (values: z.infer<typeof StoreShippingFormSchema>) => {
      alert('2');
      try {
        // Upserting category data
        const response = await updateStoreDefaultShippingDetails(storeUrl, {
           defaultShippingService: values.defaultShippingService,
           defaultShippingFeePerItem: values.defaultShippingFeePerItem,
           defaultShippingFeeForAdditionalItem: values.defaultShippingFeeForAdditionalItem,
           defaultShippingFeePerKg: values.defaultShippingFeePerKg,
           defaultShippingFeeFixed: values.defaultShippingFeePerKg,
           defaultDeliveryTimeMin: values.defaultDeliveryTimeMin,
           defaultDeliveryTimeMax: values.defaultDeliveryTimeMax,
           returnPolicy: values.returnPolicy,
        });

        if (response.id) {
        toast ({
            title: "Store Default shipping details has been updated.",
        });

        router.refresh();
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
                <CardTitle>Store Default Shipping details</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit, handleSubmit1)}
                      className="space-y-4"
                >
                <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultShippingService"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping Service name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-4">
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultShippingFeePerItem"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping fee per item</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={0}
                      step={0.1}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultShippingFeeForAdditionalItem"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping fee for additional item</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={0}
                      step={0.1}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="flex flex-wrap gap-4">
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultShippingFeePerKg"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Shipping fee per kg</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={0}
                      step={0.1}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultShippingFeeFixed"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fixed Shipping fee</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={0}
                      step={0.1}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="flex flex-wrap gap-4">
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultDeliveryTimeMin"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Minimum Delivery time (days)</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={0}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // disabled={isLoading}
                control={form.control}
                name="defaultDeliveryTimeMax"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Maximum Delivery time (days)</FormLabel>
                    <FormControl>
                      <NumberInput defaultValue={field.value} onValueChange={field.onChange}
                      min={1}
                      className="!pl-1 !shadow-none rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <FormField
                control={form.control}
                name="returnPolicy"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Return policy</FormLabel>
                    <FormControl>
                      <Textarea 
                      {...field}
                      placeholder="Description" 
                      className="p-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                 ? "loading..."
                 :"Save changes"}
              </Button>
           </form>
         </Form>
        </CardContent>
      </Card>
   </AlertDialog>
);
};

export default StoreDefaultShippingDetails;