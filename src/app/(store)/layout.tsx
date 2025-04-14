import CategoriesHeader from "@/components/sotre/layout/categories-header/categories-header";
import Footer from "@/components/sotre/layout/footer/footer";
import Header from "@/components/sotre/layout/header/header";
import { ReactNode } from "react";

import { Toaster } from "react-hot-toast";

export default function StoreLayout({ children }: { children: ReactNode }) {
    return (
    <div>
      <Header />
      <CategoriesHeader />
      <div>{children}</div>
      <div className="h-96"></div>
      <Footer />
      <Toaster position="top-center" />
    </div>
    );
}
