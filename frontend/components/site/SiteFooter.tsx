import Link from "next/link";

const links = [
  { href: "/aboutus", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="text-lg font-semibold">NovaMed Group</p>
          <p className="mt-2 text-sm text-white/75">Clinic appointments made simple.</p>
        </div>
        <div>
          <p className="font-semibold">Opening hours</p>
          <p className="mt-2 text-sm text-white/75">Monday – Friday, 08:00 – 18:00</p>
          <p className="text-sm text-white/75">Closed on weekends</p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/85 no-underline hover:text-white hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/60 md:px-6">
          © {new Date().getFullYear()} NovaMed Group. A demo project — NovaMed is not a real clinic.
        </p>
      </div>
    </footer>
  );
}
