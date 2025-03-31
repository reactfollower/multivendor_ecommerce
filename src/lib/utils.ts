import { PrismaClient } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import ColorThief from "colorthief";

import { db } from "./db";
import { Country } from "./types";
import countries from "@/data/countries.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to genarae a unique slug
export const generateUniqueSlug = async (
  baseSlug: string,
  model: keyof PrismaClient,
  field: string = "slug",
  separator: string = "-"
) => {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const exisitngRecord = await (db[model] as any).findFirst({
      where: {
        [field]: slug,
      },
    });
    if (!exisitngRecord) {
      break;
    }
    slug = `${slug}${separator}${suffix}`;
    suffix += 1;
  }
  return slug;
};

export const getGridClassName = (length: number) => {
  switch (length) {
    case 2:
    return "grid-cols-2";
    case 3:
    return "grid-cols-2 grid-rows-2";
    case 4:
    return "grid-cols-2 grid-rows-1";
    case 5:
    return "grid-cols-2 grid-rows-6";
    case 6:
    return "grid-cols-2";
    default:
      return "";
  }
}

export const getDominantColors = (imgUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 4).map((color) => {
          // Convert RGB array to hex string
          return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
        });
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

// the helper function to get the user country
// Define the default country
const DEFAULT_COUNTRY: Country = {
  name: "United States",
  code: "US",
  city: "",
  region: "",
}

export async function getUserCountry(): Promise<Country> {
  console.log('getusercountry');
  let userCountry: Country = DEFAULT_COUNTRY;
  try {
    // Attempt to detect country by IP
    const response = await fetch(`https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`);
    if (response.ok) {
      console.log('getcontry!');
      const data = await response.json();
      console.log(data);
      userCountry={
        name:countries.find((c)=>c.code===data.country)?.name || data.country,
        code: data.country,
        city: data.city,
        region: data.region,
      };
    }
    //console.log(response);
  } catch (error) {
    console.log("Failed to fetch IP info", error);
  }
  return userCountry;
}
