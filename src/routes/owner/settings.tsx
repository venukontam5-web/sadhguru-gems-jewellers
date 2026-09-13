import { createFileRoute, Link } from "@tanstack/react-router";
import { AppearanceEditor } from "@/components/appearance-editor";
import { TouchRegisterCard } from "@/components/touch-id";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/owner/settings")({
  component: OwnerSettings,
});

function OwnerSettings() {
  const user = useCurrentUser();
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-parchment/60">
        Fonts, colours, and themes. What you save is what every visitor sees. Google Ads IDs live
        on their own drawer.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/owner/security" className="text-bronze hover:text-bronze-soft">
          Biometric security →
        </Link>
        <span className="mx-2 text-parchment/30">·</span>
        <Link to="/owner/ads" className="text-bronze hover:text-bronze-soft">
          Google Ads IDs →
        </Link>
        <span className="mx-2 text-parchment/30">·</span>
        <Link to="/owner/payments" className="text-bronze hover:text-bronze-soft">
          Razorpay →
        </Link>
        <span className="mx-2 text-parchment/30">·</span>
        <Link to="/owner/users" className="text-bronze hover:text-bronze-soft">
          Users / roles →
        </Link>
      </p>
      {user?.primaryEmail ? (
        <div className="mt-8 max-w-xl">
          <TouchRegisterCard email={user.primaryEmail} name={user.displayName ?? undefined} dark />
        </div>
      ) : null}
      <div className="mt-8">
        <AppearanceEditor showHeading={false} />
      </div>
    </div>
  );
}