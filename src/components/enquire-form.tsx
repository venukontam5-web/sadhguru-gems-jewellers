import { useState, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SITE, whatsappHref } from "@/data/site";
import { trackLead } from "@/lib/analytics";
import { writeGuest } from "@/lib/visit";
import { submitEnquiry } from "@/server/catalogue";
import { cn } from "@/lib/utils";

type Props = {
  subject?: string;
  heading?: string;
};

export function EnquireForm({ subject = "General enquiry", heading }: Props) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitEnquiry({
        data: { name, phone, email, subject, message },
      });
      writeGuest({ name, phone, email });
      trackLead(subject);
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    const wa = whatsappHref(
      `Namaste, I am ${name || "a guest"}. I would like to talk about: ${subject}. ${message}`.trim(),
    );
    return (
      <div className="rounded-[22px] bg-ivory p-8 shadow-card">
        <p className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">Received</p>
        <h3 className="mt-2 font-display text-3xl font-semibold">Thank you, {name || "friend"}.</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Your note is with the owner panel. The fastest reply is WhatsApp — the shop is open {SITE.hours}.
        </p>
        <a href={wa} className={cn(buttonVariants(), "mt-6")}>
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-[22px] bg-ivory p-6 shadow-card sm:p-8">
      {heading ? (
        <h3 className="mb-6 font-display text-2xl font-semibold">{heading}</h3>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="eq-name">Name</Label>
          <Input id="eq-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="eq-phone">Phone</Label>
          <Input
            id="eq-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="eq-email">Email</Label>
        <Input
          id="eq-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="eq-msg">How can we help</Label>
        <Textarea
          id="eq-msg"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`I would like to know more about ${subject.toLowerCase()}…`}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send enquiry"}
        </Button>
        <a href={SITE.phoneHref} className="text-sm text-ink-muted hover:text-ink">
          Or call {SITE.phone}
        </a>
      </div>
    </form>
  );
}
