import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details ";
import { getAllCategories } from "@/queries/category";

export default async function AdminSubCategoriesPage() {
  const categories = await getAllCategories();
  return (
    <SubCategoryDetails categories = {categories} />
  );
}
