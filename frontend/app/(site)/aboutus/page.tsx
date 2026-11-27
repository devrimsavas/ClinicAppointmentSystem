import type { Metadata } from "next";
import Image from "next/image";
import TextPage from "@/components/site/TextPage";

export const metadata: Metadata = { title: "About us" };

export default function AboutUsPage() {
  return (
    <TextPage title="About NovaMed Group" intro="Patient-centred care, supported by simple technology and caring professionals.">
      <div className="relative -mx-2 aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src="/aboutus.png" alt="NovaMed team" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover object-[50%_25%]" />
      </div>
      <section>
        <h2>Who we are</h2>
        <p>NovaMed is a group of clinics and specialists working together to make healthcare easier to reach. We help patients find the right doctor and book an appointment online.</p>
      </section>
      <section>
        <h2>What we do</h2>
        <p>Our booking service lets you see available times, choose a doctor and clinic, and book in a few minutes — without creating an account.</p>
      </section>
      <section>
        <h2>Why choose us</h2>
        <ul>
          <li>Easy and secure online booking</li>
          <li>Qualified doctors across several specialities</li>
          <li>Clear opening hours: weekdays 08:00 – 18:00</li>
          <li>Your personal data is only used to manage your appointment</li>
        </ul>
      </section>
      <p className="text-sm italic text-muted">NovaMed is a fictional clinic group created for a portfolio project.</p>
    </TextPage>
  );
}
