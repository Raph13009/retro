import Image from "next/image";
import Link from "next/link";
import { BRAND_ASSETS, PRODUCT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  variant?: "full" | "icon";
  theme?: "light" | "dark";
  compactOnMobile?: boolean;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

function WordmarkText({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("text-lg font-bold tracking-tight sm:text-xl", className)}>
      <span className={dark ? "text-white" : "text-[#1a1828]"}>paraboll</span>
      <span className={cn("font-semibold", dark ? "text-[#B7F0D1]" : "text-[#3f7463]")}>.online</span>
    </span>
  );
}

export function BrandLogo({
  href = "/",
  variant = "full",
  theme = "light",
  compactOnMobile = true,
  className,
  imageClassName,
  priority = false
}: BrandLogoProps) {
  const label = PRODUCT_NAME;

  const icon = (
    <Image
      src={BRAND_ASSETS.icon}
      alt=""
      width={120}
      height={120}
      priority={priority}
      className={cn(
        "h-11 w-11 object-contain sm:h-12 sm:w-12",
        imageClassName
      )}
      aria-hidden
    />
  );

  const content =
    variant === "icon" ? (
      <Image
        src={BRAND_ASSETS.icon}
        alt={label}
        width={120}
        height={120}
        priority={priority}
        className={cn(
          "h-11 w-11 object-contain sm:h-12 sm:w-12",
          imageClassName
        )}
      />
    ) : theme === "light" ? (
      <>
        {compactOnMobile ? <span className="sm:hidden">{icon}</span> : null}
        <span className={cn("inline-flex items-center gap-2.5", compactOnMobile && "hidden sm:inline-flex")}>
          {icon}
          <WordmarkText />
        </span>
      </>
    ) : (
      <>
        {compactOnMobile ? <span className="sm:hidden">{icon}</span> : null}
        <span className={cn("inline-flex items-center gap-2.5", compactOnMobile && "hidden sm:inline-flex")}>
          {icon}
          <WordmarkText dark />
        </span>
      </>
    );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE7E1]",
        className
      )}
      aria-label={`${label} home`}
    >
      {content}
    </Link>
  );
}
