import ThemeToggle from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { updateVariantImage } from "@/migration-scripts/migrate-variantImage";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default async function HomePage() {
  // await updateVariantImage();
  return (
      <UserButton/>
  );
}
