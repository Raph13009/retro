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

function WordmarkText({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg font-bold tracking-tight sm:text-xl", className)}>
      <span className="text-[#1a1828]">paraboll</span>
      <span className="font-semibold text-[#6d668f]">.online</span>
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
      className={cn("h-9 w-9 object-contain sm:h-10 sm:w-10", imageClassName)}
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
        className={cn("h-9 w-9 object-contain sm:h-10 sm:w-10", imageClassName)}
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
        {compactOnMobile ? (
          <Image
            src={BRAND_ASSETS.icon}
            alt={label}
            width={120}
            height={120}
            priority={priority}
            className={cn("h-9 w-9 object-contain sm:hidden", imageClassName)}
          />
        ) : null}
        <Image
          src={BRAND_ASSETS.wordmarkDark}
          alt={label}
          width={640}
          height={160}
          priority={priority}
          className={cn(
            "h-8 w-auto max-w-[min(100%,11.5rem)] object-contain object-left sm:h-9 sm:max-w-[14rem] lg:max-w-[16rem]",
            compactOnMobile && "hidden sm:block",
            imageClassName
          )}
        />
      </>
    );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c83ad]",
        className
      )}
      aria-label={`${label} home`}
    >
      {content}
    </Link>
  );
}
