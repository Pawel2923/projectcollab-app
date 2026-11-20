export interface FeatureSectionProps {
  name: string
  description: string
  imageSrc: string
  imageAlt: string
  imageWidth?: number
  imageHeight?: number
  order?: "TEXT_FIRST" | "IMAGE_FIRST"
}

export function FeatureSection({
  name,
  description,
  imageSrc,
  imageAlt,
  imageWidth = 1843,
  imageHeight = 1271,
  order = "TEXT_FIRST",
}: FeatureSectionProps) {
  return (
    <div
      className={`flex w-full flex-col justify-between gap-8 md:gap-24 ${order === "TEXT_FIRST" ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      <div
        className={`flex max-w-137.5 min-w-0 flex-col justify-center gap-2.5 py-2 ${order === "TEXT_FIRST" ? "" : "md:ms-auto"}`}
      >
        <h3 className="text-lg font-medium md:text-xl">{name}</h3>
        <p className="text-sm leading-relaxed md:text-base">{description}</p>
      </div>
      <div className={`max-w-lg ${order === "TEXT_FIRST" ? "ms-auto" : "me-auto"}`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="w-full rounded-sm border border-image-border"
          style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
          loading="lazy"
        />
      </div>
    </div>
  )
}
