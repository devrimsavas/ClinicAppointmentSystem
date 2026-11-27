import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="NovaMed home">
      <Image src="/novamedlogo.png" alt="NovaMed Group" width={826} height={280} priority className="h-12 w-auto md:h-14" />
    </Link>
  );
}
