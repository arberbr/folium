import Image from "next/image";
import { cn } from "@/lib/utils";

export function FolioShot({
  src,
  alt,
  caption,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  caption: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/40 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)]">
        <Image
          src={src}
          alt={alt}
          width={1440}
          height={900}
          priority={priority}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="h-auto w-full"
        />
      </div>
      <figcaption className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
