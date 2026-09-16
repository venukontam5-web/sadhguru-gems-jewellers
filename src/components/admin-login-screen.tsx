import { Link } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Wordmark } from "@/components/logo";
import { SITE } from "@/data/site";
import { MediaImg } from "@/components/product-photo";

export function AdminLoginScreen() {
  return (
    <main className="grid min-h-dvh bg-[#08110e] text-parchment lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <MediaImg
          src="/images/showroom.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08110e] via-[#08110e]/55 to-[#08110e]/25" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <Wordmark className="h-14 max-w-[240px]" />
          <p className="mt-4 max-w-sm font-display text-3xl leading-tight">
            The cabinet for the house on Akkalkot Road.
          </p>
          <p className="mt-3 text-sm text-parchment/70">
            Products, slides, enquiries, and the look of the shop — fonts, colours, themes.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:py-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-block max-w-full lg:hidden">
            <Wordmark className="h-12 max-w-[min(220px,80vw)]" />
          </Link>
          <p className="mt-8 text-xs font-medium tracking-[0.22em] text-bronze uppercase lg:mt-0">
            SGJ Admin
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Admin login</h1>
          <p className="mt-3 text-sm leading-relaxed text-parchment/70">
            Hidden behind Est. {SITE.established} at the foot of the shop. Visitors see Sign in.
            This door is for the house only.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
          <p className="mt-8 text-xs text-parchment/45">
            {SITE.legalName} · Est. {SITE.established}
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-parchment/60 hover:text-parchment">
            ← Back to the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
