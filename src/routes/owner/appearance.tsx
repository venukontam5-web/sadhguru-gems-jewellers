import { createFileRoute } from "@tanstack/react-router";
import { AppearanceEditor } from "@/components/appearance-editor";

export const Route = createFileRoute("/owner/appearance")({
  component: OwnerAppearance,
});

function OwnerAppearance() {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Look of the shop</p>
      <h1 className="font-display text-4xl font-semibold">Website style</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-parchment/60">
        Font and size, website colours with Save, and ready-made themes. What you save here is
        what every visitor sees on sadhgurugemsandjewellers.com.
      </p>
      <div className="mt-8">
        <AppearanceEditor showHeading={false} />
      </div>
    </div>
  );
}
