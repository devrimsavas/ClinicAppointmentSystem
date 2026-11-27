import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarDays, Clock, Info, Mail, Stethoscope, type LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import IconBadge from "@/components/ui/IconBadge";

interface ServiceCard {
  href: string;
  title: string;
  text: string;
  link: string;
  icon: LucideIcon;
  tone: "mint" | "sky" | "soft";
}

const cards: ServiceCard[] = [
  { href: "/book", title: "Book an appointment", text: "Choose a clinic, a doctor and a time that suits you.", link: "Book now", icon: CalendarCheck, tone: "mint" },
  { href: "/doctors", title: "Find a doctor", text: "Search our doctors by name and see their speciality and clinic.", link: "Search doctors", icon: Stethoscope, tone: "sky" },
  { href: "/calendar", title: "Availability", text: "See which times are already booked before you choose.", link: "View calendar", icon: CalendarDays, tone: "soft" },
  { href: "/aboutus", title: "About NovaMed", text: "Who we are and how we work with clinics and specialists.", link: "Read more", icon: Info, tone: "sky" },
  { href: "/contact", title: "Contact us", text: "Questions about a booking? Send us a message.", link: "Get in touch", icon: Mail, tone: "mint" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative mx-auto w-64 sm:w-80 md:w-full md:max-w-md">
          <div className="absolute -bottom-3 -left-3 h-24 w-24 rounded-full bg-mint" aria-hidden />
          <div className="absolute -right-2 top-4 h-6 w-6 rounded-full bg-white" aria-hidden />
          <div className="relative aspect-square overflow-hidden rounded-full border-8 border-white">
            <Image src="/aboutus.png" alt="NovaMed doctors and nurses" fill priority sizes="(max-width: 768px) 320px, 448px" className="object-cover object-top" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl leading-tight md:text-6xl">
            Welcome to <br /> NovaMed clinics
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/80">
            Book an appointment with one of our doctors in a few minutes — no phone queue, no account needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/book">
              Book an appointment <ArrowRight className="h-4 w-4" aria-hidden />
            </LinkButton>
            <LinkButton href="/doctors" variant="secondary">
              Find a doctor
            </LinkButton>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4" aria-hidden /> Open Monday – Friday, 08:00 – 18:00
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="mt-20">
        <h2 className="sr-only">What you can do</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="card group flex flex-col p-6 no-underline transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl">{card.title}</h3>
                <IconBadge icon={card.icon} tone={card.tone} size="lg" />
              </div>
              <p className="mt-3 flex-1 text-muted">{card.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {card.link}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
