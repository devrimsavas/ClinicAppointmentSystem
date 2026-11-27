import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <Image src="/notfoundimage.png" alt="" width={320} height={320} className="rounded-full" priority />
      <h1 className="mt-6 text-3xl">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist or has been moved.</p>
      <LinkButton href="/" className="mt-6">Back to home</LinkButton>
    </main>
  );
}
