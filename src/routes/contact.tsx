import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { EnquireForm } from "@/components/enquire-form";
import { SITE, fullAddress, whatsappHref } from "@/data/site";
import { GBP } from "@/data/gbp";
import { pageHead, localBusinessJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { MediaImg } from "@/components/product-photo";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    pageHead(
      "Gemstone shop contact in Solapur — visit & WhatsApp",
      "Visit the official Sadhguru Gems & Jewellers shop at 106 New Sunil Nagar, Akkalkot Road, Kumbhari, Solapur 413006. Call +91 70207 35981 or WhatsApp.",
      "/contact",
    ),
});

function ContactPage() {
  return (
    <SiteShell>
      <JsonLd data={localBusinessJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact Solapur shop", path: "/contact" },
        ])}
      />
      <PageHero
        kicker="Contact"
        title="The official shop on Akkalkot Road."
        lede={GBP.fromTheBusiness}
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <MapPin className="mt-0.5 size-5 text-garnet" />
              <div>
                <p className="text-xs tracking-[0.16em] text-stone uppercase">Address</p>
                <p className="mt-1 leading-relaxed">{fullAddress()}</p>
                <a
                  href={SITE.mapsLink}
                  className="mt-1 inline-block text-sm text-garnet hover:text-garnet-deep"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-0.5 size-5 text-garnet" />
              <div>
                <p className="text-xs tracking-[0.16em] text-stone uppercase">Phone & WhatsApp</p>
                <a href={SITE.phoneHref} className="mt-1 block">
                  {SITE.phone}
                </a>
                <a href={whatsappHref()} className="text-sm text-garnet">
                  Message on WhatsApp
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-0.5 size-5 text-garnet" />
              <div>
                <p className="text-xs tracking-[0.16em] text-stone uppercase">Email</p>
                <a href={SITE.emailHref} className="mt-1 block">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-0.5 size-5 text-garnet" />
              <div>
                <p className="text-xs tracking-[0.16em] text-stone uppercase">Hours</p>
                <p className="mt-1">
                  {SITE.hours}
                  <br />
                  {SITE.hoursNote}
                </p>
              </div>
            </li>
          </ul>
          <p className="mt-8 text-xs tracking-[0.16em] text-stone uppercase">Google Business</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Search Google Maps for <strong className="text-ink">{GBP.name}</strong>. The official website on that pin must be{" "}
            <a href={SITE.url} className="text-garnet hover:text-garnet-deep">
              {SITE.domain}
            </a>
            — not sgj.world.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {GBP.services.slice(0, 8).map((s) => (
              <li key={s} className="rounded-full bg-ivory px-3 py-1.5 text-xs text-ink shadow-card">
                {s}
              </li>
            ))}
          </ul>
          <a
            href={SITE.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="relative mt-10 block overflow-hidden rounded-[22px] shadow-card"
          >
            <MediaImg
              src="/images/showroom.jpg"
              alt="The shop on Akkalkot Road, Solapur"
              className="h-64 w-full object-cover"
              sizes="100vw"
            />
            <span className="absolute inset-x-0 bottom-0 bg-ink/75 px-5 py-4 text-sm text-parchment">
              {SITE.address.line1}, {SITE.address.locality} — open in Google Maps
            </span>
          </a>
        </div>
        <EnquireForm heading="Write to the shop" subject="Website enquiry" />
      </section>
    </SiteShell>
  );
}
