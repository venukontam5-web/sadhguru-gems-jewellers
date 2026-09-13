import { createFileRoute } from "@tanstack/react-router";
import { BiometricPanel } from "@/components/touch-id";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/owner/security")({
  component: OwnerSecurity,
});

function OwnerSecurity() {
  const user = useCurrentUser();
  return (
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Biometric security</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Touch ID, Face ID, and Windows Hello for this device. Visitors never see this drawer.
        A password remains the spare key.
      </p>
      {user?.primaryEmail ? (
        <div className="mt-8">
          <BiometricPanel email={user.primaryEmail} name={user.displayName ?? undefined} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-parchment/50">Sign in first.</p>
      )}
    </div>
  );
}
