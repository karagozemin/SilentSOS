import Image from "next/image";

type Props = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function BrandLogo({ className = "", size = 120, priority = false }: Props) {
  return (
    <Image
      src="/silentsos-logo.png"
      alt="SilentSOS"
      width={size}
      height={size}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
    />
  );
}
