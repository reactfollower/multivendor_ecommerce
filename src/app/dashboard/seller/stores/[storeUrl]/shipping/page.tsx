import StoreDefaultShippingDetails from '@/components/dashboard/forms/store-default-shipping-details';
import { getStoreDefaultShippingDetails, getStoreShippingRates } from '@/queries/store';
import React from 'react'
import { redirect } from "next/navigation";
import DataTable from '@/components/ui/data-table';
import { columns } from './columns';

export default async function SellerstoreShippingPage({
  params,
}: {
  params: { storeUrl: string };
}) {
  const shippingDetails = await getStoreDefaultShippingDetails((await params).storeUrl);
  console.log("shippingDetails", shippingDetails);
  if (!shippingDetails) {
   // console.log("&&&&&&&&&&&&&&&&&&&&&&&");
    return redirect("/");
  }
  const shippingRates = await getStoreShippingRates((await params).storeUrl);
  //console.log(shippingRates);
  
  return (
    <div>
      <StoreDefaultShippingDetails 
      data={shippingDetails}
      storeUrl={(await params).storeUrl} 
      />
      <DataTable 
        filterValue="countryName" 
        data={shippingRates}
        columns={columns}
        searchPlaceholder='Search by country name...'
      />
    </div>
  )
}
