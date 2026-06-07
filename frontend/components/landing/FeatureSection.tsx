import type { StaticImageData } from "next/image";
import Image from "next/image";
import React from "react";

interface FeatureSectionProps {
  name: string;
  description: string;
  imageSrc: StaticImageData;
  imageAlt: string;
  order?: "TEXT_FIRST" | "IMAGE_FIRST";
}

export function FeatureSection({
  name,
  description,
  imageSrc,
  imageAlt,
  order = "TEXT_FIRST",
}: FeatureSectionProps) {
  return (
    <div
      className={`flex flex-col w-full justify-between gap-10 md:gap-24 ${order === "TEXT_FIRST" ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      <div className="flex flex-col flex-1 gap-2.5 py-2 justify-center">
        <h3 className="font-medium text-xl">{name}</h3>
        <p className="min-w-58 max-w-137.5">{description}</p>
      </div>
      <div className="mx-auto">
        <Image
          src={imageSrc}
          alt={imageAlt}
          className="w-full max-w-lg rounded-sm border-image-border border"
        />
      </div>
    </div>
  );
}
