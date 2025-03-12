import Image from "next/image";
import { FC } from "react";

// Logo Image 
import LogoImg from "../../../public/assets/icons/logo-1.png";

interface LogoProps{
    width : string;
    height: string;
}

const Logo:FC<LogoProps>=({ width, height })=>{
    return <div className="z-50" style={{ width: width, height: height}}>
        <Image
          src={LogoImg}
          alt="GoShop"
          className="w-ful h-full object-cover overflow-visible"
          />
    </div>;
};

export default Logo;