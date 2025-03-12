import { getAllCategories } from "@/queries/category";
import React from "react";

import DataTable from "@/components/ui/data-table";
import CategoryDetails from "@/components/dashboard/forms/category-details";
import { Plus } from "lucide-react";
import { columns } from "./columns";

export default async function AdminCategoriesPage() {

    const categories = await getAllCategories();

    if (!categories) return null;

    return (
           <DataTable
             actionButtonText = {
                <>
                <Plus size={15} />
                Create category
                </>
             }
             modalChildren={<CategoryDetails />}
             newTabLink="/dashboard/admin/categories/new"
             filterValue="name"
             data={categories}
             searchPlaceholder="Search category name..."
             columns={columns}
        />
    );
}
