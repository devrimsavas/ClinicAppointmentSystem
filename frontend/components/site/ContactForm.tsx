"use client";

import { useState } from "react";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

// Demo form: messages are not sent anywhere.
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    setSent(true);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {sent && <Alert type="success" message="Thank you! This is a demo, so your message was not sent anywhere." />}
      <div>
        <label htmlFor="name" className="label">Your name</label>
        <input id="name" name="name" className="input" required autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={5} className="input resize-none" required />
      </div>
      <Button type="submit">Send message</Button>
    </form>
  );
}
