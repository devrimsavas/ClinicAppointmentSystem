import type { Metadata } from "next";
import { Clock, Mail } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import IconBadge from "@/components/ui/IconBadge";
import PageTitle from "@/components/ui/PageTitle";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageTitle title="Contact us" description="Questions about a booking? Send us a message." />
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="card p-6 md:p-8 lg:col-span-2">
          <ContactForm />
        </div>
        <aside className="space-y-4">
          <div className="card flex items-center gap-4 p-5">
            <IconBadge icon={Clock} tone="mint" />
            <div>
              <p className="font-semibold text-primary">Opening hours</p>
              <p className="text-sm text-muted">Monday – Friday, 08:00 – 18:00</p>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <IconBadge icon={Mail} tone="sky" />
            <div>
              <p className="font-semibold text-primary">Email</p>
              <p className="text-sm text-muted">support@novamed.example</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
