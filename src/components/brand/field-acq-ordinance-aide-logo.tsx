import { cn } from "@/lib/utils";

// Preserve the supplied pixels while removing the PNG's transparent export canvas.
const ARTWORK_CROP = {
  height: "163.4343%",
  left: "-5.8319%",
  top: "-27.8788%",
  width: "111.0349%",
} as const;

export function FieldAcqOrdinanceAideLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative block aspect-[1749/495] shrink-0 overflow-hidden", className)}>
      <img
        alt="Field ACQ Ordinance Aide"
        className="absolute max-w-none"
        decoding="async"
        height={809}
        src="/field-acq-ordinance-aide-logo-v2.png"
        style={ARTWORK_CROP}
        width={1942}
      />
    </span>
  );
}
