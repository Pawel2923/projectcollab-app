interface FeatureSectionProps {
  name: string
  description: string
  imageSrc: string
  imageAlt: string
  order?: "TEXT_FIRST" | "IMAGE_FIRST"
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
      className={`flex w-full flex-col justify-between gap-8 md:gap-24 ${order === "TEXT_FIRST" ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      <div
        className={`flex max-w-137.5 min-w-0 flex-col justify-center gap-2.5 py-2 ${order === "TEXT_FIRST" ? "" : "md:ms-auto"}`}
      >
        <h3 className="text-lg font-medium md:text-xl">{name}</h3>
        <p className="text-sm leading-relaxed md:text-base">{description}</p>
      </div>
      <div className={`${order === "TEXT_FIRST" ? "ms-auto" : "me-auto"}`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full max-w-lg rounded-sm border border-image-border"
          loading="lazy"
        />
      </div>
    </div>
  )
}
