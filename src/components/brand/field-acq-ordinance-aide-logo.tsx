import { cn } from "@/lib/utils";

export function FieldAcqOrdinanceAideLogo({ className }: { className?: string }) {
  return (
    <img
      alt="Field ACQ Ordinance Aide"
      className={cn("h-auto w-auto object-contain", className)}
      src="/field-acq-ordinance-aide-logo.png"
    />
  );
}
