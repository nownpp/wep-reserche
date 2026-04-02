"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";

type AdBannerProps = {
  type?: "horizontal" | "square";
};

export default function AdBanner({ type = "horizontal" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteConfig.enableAds) return;

    // لمنع تكرار الإعلان في بيئة تطوير React Strict Mode
    if (adRef.current && adRef.current.childElementCount === 0) {
      
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      
      const script = document.createElement('script');
      script.type = 'text/javascript';

      if (type === "horizontal") {
         conf.innerHTML = `
          atOptions = {
            'key' : 'b8ecb3fff117c8e728efa504cef5fa2c',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        `;
        script.src = 'https://www.highperformanceformat.com/b8ecb3fff117c8e728efa504cef5fa2c/invoke.js';
      } else {
         conf.innerHTML = `
          atOptions = {
            'key' : 'b2a51a8fd500bc3d04919689901e89f1',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        `;
        script.src = 'https://www.highperformanceformat.com/b2a51a8fd500bc3d04919689901e89f1/invoke.js';
      }

      adRef.current.appendChild(conf);
      adRef.current.appendChild(script);
    }
  }, [type]);

  if (!siteConfig.enableAds) return null;

  if (type === "horizontal") {
    return (
      <div className="w-full my-4 flex justify-center items-center overflow-hidden">
        <div ref={adRef} className="mx-auto flex justify-center min-h-[60px] min-w-[468px]"></div>
      </div>
    );
  } else {
    // المربع الجانبي 300x250
    return (
      <div className="w-full my-4 flex justify-center items-center overflow-hidden">
        <div ref={adRef} className="mx-auto flex justify-center min-h-[250px] min-w-[300px]"></div>
      </div>
    );
  }
}
