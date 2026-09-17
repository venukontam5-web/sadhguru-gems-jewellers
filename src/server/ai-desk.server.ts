import { getSql } from "@/lib/db";
import { SITE } from "@/data/site";
import { reachMail, reachWhatsApp } from "@/lib/leads";

type AiChannel = {
  id: string;
  label: string;
  href: string;
  note: string;
  live: boolean;
};

type AiNeed = { need: string; n: number };
type AiPerson = {
  name: string;
  need: string;
  place: string;
  contact: string;
  email: string;
  source: string;
  mailHref: string;
  waHref: string;
};

function channels(): AiChannel[] {
  return [
    {
      id: "shop",
      label: "Website",
      href: SITE.url,
      note: "Official cabinet",
      live: true,
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business",
      href: `https://wa.me/${SITE.whatsapp}`,
      note: SITE.phone,
      live: true,
    },
    {
      id: "mail",
      label: "House mail",
      href: SITE.emailHref,
      note: SITE.email,
      live: true,
    },
    {
      id: "facebook",
      label: "Facebook Business",
      href: SITE.facebook,
      note: "Business Page",
      live: true,
    },
    {
      id: "instagram",
      label: "Business Instagram",
      href: SITE.instagram,
      note: "@sadhguru_gems_and_jewellers",
      live: true,
    },
    {
      id: "meta",
      label: "Meta Business Suite",
      href: "https://business.facebook.com/",
      note: "FB + IG inbox in one hang",
      live: true,
    },
    {
      id: "wa-app",
      label: "WhatsApp Business app",
      href: "https://business.whatsapp.com/",
      note: "Catalog and labels",
      live: true,
    },
    {
      id: "gmail",
      label: "Gmail compose",
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}`,
      note: "Autopilot opens drafts here",
      live: true,
    },
  ];
}

function solveProblem(q: string, facts: { needs: AiNeed[]; people: number; mail: number; wa: number }) {
  const s = q.toLowerCase();
  if (/deploy|vercel|github|live|domain|ssl|hang/.test(s)) {
    return {
      title: "Deploy hang",
      steps: [
        "GitHub book is already live.",
        "On the phone: Authorize Vercel on that book (one Allow tap).",
        "Import www.sadhgurugemsandjewellers.com on the Hobby team.",
        "Add domain sadhgurugemsandjewellers.com. SSL is automatic.",
      ],
      links: [
        { label: "Import GitHub → Vercel", href: `https://vercel.com/new/import?s=${SITE.githubUrl}` },
        { label: "GitHub book", href: SITE.githubUrl },
        { label: "Live desk", href: "/owner/live" },
      ],
    };
  }
  if (/login|admin|desk|password/.test(s)) {
    return {
      title: "Desk access",
      steps: [
        "Customers use Sign in. The owner desk is not on the public menu.",
        "Open /admin on this phone, then the house login.",
        "Staff IDs live under Staff login IDs.",
      ],
      links: [
        { label: "Staff IDs", href: "/owner/users" },
        { label: "Biometric", href: "/owner/security" },
      ],
    };
  }
  if (/razorpay|pay|key|api/.test(s)) {
    return {
      title: "Till and keys",
      steps: [
        "Paste Key ID (rzp_…) then Key Secret on API keys.",
        "Save & wire. Open the Razorpay access link.",
        "Merchant ID is already stamped.",
      ],
      links: [
        { label: "API keys", href: "/owner/keys" },
        { label: "Razorpay till", href: "/owner/payments" },
      ],
    };
  }
  if (/mail|email|autopilot/.test(s)) {
    return {
      title: "Mail autopilot",
      steps: [
        `${facts.mail} drafts waiting. Autopilot opens the house mail with the stone they asked for.`,
        "Tap Send next. Gmail opens. Send. The desk marks Reached.",
        "Does not scrape strangers — only people who wrote or visited with a mail ID.",
      ],
      links: [{ label: "Mail queue", href: "/owner/ai" }],
    };
  }
  if (/whatsapp|instagram|facebook|social|meta/.test(s)) {
    return {
      title: "One platform",
      steps: [
        "Website, WhatsApp, Facebook, Instagram, and mail sit on this desk.",
        "Meta Business Suite is the FB + IG inbox. WhatsApp Business is the till chat.",
        "Share the shop link. Collect visits. Reach from this AI desk.",
      ],
      links: [
        { label: "Meta Suite", href: "https://business.facebook.com/" },
        { label: "WhatsApp Business", href: "https://business.whatsapp.com/" },
        { label: "Shop", href: SITE.url },
      ],
    };
  }
  if (/customer|lead|need|enquiry|visit/.test(s)) {
    const top = facts.needs[0]?.need ?? "gemstones";
    return {
      title: "Customer needs",
      steps: [
        `${facts.people} people on the book. Top ask: ${top}.`,
        "Collect from visits and enquiries, then reach on WhatsApp or mail.",
        "AI here reads the shop book — not other people's accounts.",
      ],
      links: [
        { label: "Needs", href: "/owner/ai" },
        { label: "Visitors", href: "/owner/visitors" },
      ],
    };
  }
  if (/stock|barcode|bill|gst/.test(s)) {
    return {
      title: "Counter and cabinet",
      steps: ["Bills, GST, stock, and scan are on the left tray.", "Low stock alerts sit under Inventory."],
      links: [
        { label: "Bills", href: "/owner/bills" },
        { label: "Stock", href: "/owner/inventory/stock" },
      ],
    };
  }
  return {
    title: "Hard problem, house answer",
    steps: [
      "Name the stone, the person, or the hang (deploy, till, mail).",
      `On the book now: ${facts.people} customers, ${facts.mail} mails, ${facts.wa} WhatsApp.`,
      facts.needs[0] ? `Most asked: ${facts.needs[0].need}.` : "Collect visits to see needs.",
    ],
    links: [
      { label: "This AI desk", href: "/owner/ai" },
      { label: "Live shop", href: SITE.url },
    ],
  };
}

export async function ownerAiBrief() {
    const sql = await getSql();
    await sql.query(`alter table shop_settings add column if not exists ai_mail_on boolean not null default false`).catch(() => undefined);
    let collected = 0;
    try {
      await sql.query(`
        create table if not exists sales_leads (
          id serial primary key,
          name text not null default '',
          source text not null default 'website',
          handle text not null default '',
          phone text not null default '',
          email text not null default '',
          interest text not null default 'Gemstones',
          place text not null default '',
          notes text not null default '',
          status text not null default 'New',
          next_at date,
          last_reached_at timestamptz,
          source_key text not null unique,
          created_at timestamptz not null default now()
        )`);
      await sql.query(`
        insert into sales_leads (name, source, phone, email, interest, place, status, next_at, source_key)
        select
          coalesce(nullif(name, ''), 'Visitor'),
          'website',
          coalesce(contact, ''),
          coalesce(email, ''),
          coalesce(nullif(requirement, ''), path, 'Gemstones'),
          coalesce(nullif(place, ''), country, ''),
          'New',
          (current_date + 1),
          'visit:' || id::text
        from visitors
        where coalesce(contact, '') <> '' or coalesce(email, '') <> ''
        on conflict (source_key) do update set
          phone = excluded.phone,
          email = excluded.email,
          interest = excluded.interest,
          place = excluded.place`);
      const [n] = await sql<{ n: number }>`select count(*)::int as n from sales_leads`;
      collected = Number(n?.n ?? 0);
    } catch {
      collected = 0;
    }
    await sql`update shop_settings set ai_mail_on = true, updated_at = now() where id = 1`.catch(() => undefined);
    const [flag] = await sql<{ ai_mail_on: boolean }>`select ai_mail_on from shop_settings where id = 1`.catch(
      () => [{ ai_mail_on: true }],
    );
    const people = await sql<{
      name: string;
      need: string;
      place: string;
      contact: string;
      email: string;
      source: string;
    }>`
      select name, interest as need, place, phone as contact, email, source
      from sales_leads
      order by id desc
      limit 40`.catch(() => []);
    const needs = await sql<{ need: string; n: number }>`
      select need, count(*)::int as n from (
        select coalesce(nullif(requirement, ''), 'Gemstones') as need from visitors
        union all
        select coalesce(nullif(subject, ''), 'Gemstones') from enquiries
        union all
        select coalesce(nullif(interest, ''), 'Gemstones') from sales_leads
      ) t
      group by 1
      order by n desc
      limit 8`.catch(() => []);
    const queue = await sql<{
      id: number;
      name: string;
      interest: string;
      phone: string;
      email: string;
      place: string;
      status: string;
    }>`
      select id, name, interest, phone, email, place, status
      from sales_leads
      where status <> 'Closed'
      order by id desc
      limit 80`.catch(() => []);
    const mailQueue = queue
      .filter((r) => r.email)
      .map((r) => ({
        id: Number(r.id),
        name: r.name,
        need: r.interest,
        place: r.place,
        contact: r.phone,
        email: r.email,
        source: "mail",
        mailHref: reachMail(r),
        waHref: reachWhatsApp(r),
      }));
    const waQueue = queue
      .filter((r) => r.phone)
      .map((r) => ({
        id: Number(r.id),
        name: r.name,
        need: r.interest,
        place: r.place,
        contact: r.phone,
        email: r.email,
        source: "whatsapp",
        mailHref: reachMail(r),
        waHref: reachWhatsApp(r),
      }));
    const customers: AiPerson[] = people.map((r) => ({
      name: r.name || "Visitor",
      need: r.need,
      place: r.place,
      contact: r.contact,
      email: r.email,
      source: r.source,
      mailHref: reachMail({ name: r.name, interest: r.need, email: r.email }),
      waHref: reachWhatsApp({ name: r.name, interest: r.need, phone: r.contact }),
    }));
    return {
      autopilot: Boolean(flag?.ai_mail_on),
      channels: channels(),
      needs: needs.map((n) => ({ need: n.need, n: Number(n.n) })),
      customers,
      mailQueue,
      waQueue,
      liveUrl: SITE.url,
      importUrl: `https://vercel.com/new/import?s=${SITE.githubUrl}`,
      githubUrl: SITE.githubUrl,
      vercelUrl: `https://vercel.com/${SITE.vercelTeamSlug}`,
      metaUrl: "https://business.facebook.com/",
      collected,
    };
}

export async function ownerAiToggle(data: { on: boolean }) {
    const sql = await getSql();
    await sql.query(`alter table shop_settings add column if not exists ai_mail_on boolean not null default false`);
    await sql`update shop_settings set ai_mail_on = ${data.on}, updated_at = now() where id = 1`;
    return { on: data.on };
}

export async function ownerAiReach(data: { id: number; channel: "mail" | "whatsapp" }) {
    const sql = await getSql();
    const [row] = await sql<{
      id: number;
      name: string;
      interest: string;
      phone: string;
      email: string;
    }>`select id, name, interest, phone, email from sales_leads where id = ${data.id}`;
    if (!row) throw new Error("Person not on the book.");
    await sql`
      update sales_leads
      set status = 'Reached', last_reached_at = now(), next_at = (current_date + 3)
      where id = ${data.id}`;
    const href = data.channel === "mail" ? reachMail(row) : reachWhatsApp(row);
    return { href, name: row.name };
}

export async function ownerAiSolve(data: { q: string }) {
    const sql = await getSql();
    const needs = await sql<{ need: string; n: number }>`
      select coalesce(nullif(interest, ''), 'Gemstones') as need, count(*)::int as n
      from sales_leads group by 1 order by n desc limit 5`.catch(() => []);
    const [c] = await sql<{ people: number; mail: number; wa: number }>`
      select count(*)::int as people,
        count(*) filter (where email <> '')::int as mail,
        count(*) filter (where phone <> '')::int as wa
      from sales_leads`.catch(() => [{ people: 0, mail: 0, wa: 0 }]);
    return solveProblem(data.q, {
      needs: needs.map((n) => ({ need: n.need, n: Number(n.n) })),
      people: Number(c?.people ?? 0),
      mail: Number(c?.mail ?? 0),
      wa: Number(c?.wa ?? 0),
    });
  }
