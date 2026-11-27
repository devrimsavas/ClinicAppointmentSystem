import type { Metadata } from "next";
import TextPage from "@/components/site/TextPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <TextPage title="Privacy policy" intro="Your privacy matters to us. This page explains what we collect and how we use it.">
      <section>
        <h2>1. Information we collect</h2>
        <p>When you book an appointment, we collect:</p>
        <ul>
          <li>Your full name</li>
          <li>Email address</li>
          <li>Date of birth</li>
          <li>Gender (optional)</li>
          <li>Appointment details and the reason for your visit</li>
        </ul>
      </section>
      <section>
        <h2>2. How we use your data</h2>
        <p>Your information is only used to manage your appointments. We do not sell or share your data with third parties.</p>
      </section>
      <section>
        <h2>3. Who can see your data</h2>
        <p>Only logged-in clinic staff can see patient details and appointments. The public availability calendar only shows booked times, never who booked them.</p>
      </section>
      <section>
        <h2>4. Consent</h2>
        <p>By booking an appointment, you agree to the use of your data as described here.</p>
      </section>
      <section>
        <h2>5. Your rights</h2>
        <p>You can ask to see, correct or delete your data at any time. Contact us through the contact page.</p>
      </section>
      <p className="text-sm text-muted">Last updated: November 2026</p>
    </TextPage>
  );
}
