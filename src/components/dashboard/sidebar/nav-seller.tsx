"use client";
import Link from "next/link";
import { Command, CommandEmpty, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { DashboardSidebarMenuInterface } from '@/lib/types'
import { icons } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function SidebarNavSeller({
    menuLinks,
}: {
    menuLinks:DashboardSidebarMenuInterface[];
}) {
    
const pathname=usePathname();
const storeUrlStart = pathname.split('/stores/')[1];
const activeStore = storeUrlStart ? storeUrlStart.split("/")[0] : "";

console.log("pathname-->", pathname);
    return (
        <div>
            <nav className="relativ grow">
                <Command className="rounded-lg overflow-visible bg-transparent">
                  <CommandInput placeholder="Search..." />
                  <CommandList className="py-2 overflow-visible">
                    <CommandEmpty>No Links Found.</CommandEmpty>
                    <CommandGroup className="overflow-visible pt-0 relative">
                      {menuLinks.map((link, index) => {
                        let icon;
                        const iconSearch=icons.find((icon)=>icon.value===link.icon)
                        if (iconSearch) icon = <iconSearch.path />;
                        return (
                            <CommandItem
                              key={index}
                              className={cn("w-full h-12 cursor-pointer mt-1", {
                                "bg-accent text-accent-foreground":
                                link.link === ""
                                ? pathname === `/dashboard/seller/stores/${activeStore}`
                                :`/dashboard/seller/stores/${activeStore}/${link.link}` ===
                                pathname,
                              })}
                              >
                                <Link href={`/dashboard/seller/stores/${activeStore}/${link.link}`}
                                className="flex items-center gap-2 hover:bg-transparent rouded-md transition-all w-full">
                                {icon}
                                <span>{link.label}</span>
                                </Link>
                                </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>  
            </nav>
        </div>
    );
}
