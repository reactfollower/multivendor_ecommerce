"use client";
import { FC } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  PinterestShareButton,
  PinterestIcon,
} from "next-share";
import { cn } from "@/lib/utils";

interface Props {
  url: string;
  quote: string;
  
}

const SocialShare: FC<Props> = ({ url, quote}) => {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-2", {
        // "flex-col": isCol,
      })}
    >
      <FacebookShareButton url={url} quote={quote} hashtag="#GoShop">
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={quote}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <WhatsappShareButton url={url} title={quote} separator=":: ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <PinterestShareButton url={url} media={quote}>
        <PinterestIcon size={32} round />
      </PinterestShareButton>
    </div>
  );
};

export default SocialShare;
