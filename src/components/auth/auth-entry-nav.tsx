import { Link } from "@tanstack/react-router";

type AuthEntryNavProps = {
  active: "sign-in" | "sign-up";
};

export function AuthEntryNav({ active }: AuthEntryNavProps) {
  const itemClass = (isActive: boolean) =>
    [
      "rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors",
      isActive
        ? "bg-card text-primary shadow-sm"
        : "text-muted-foreground hover:bg-card/70 hover:text-primary",
    ].join(" ");

  return (
    <nav
      aria-label="Account access"
      className="grid grid-cols-2 gap-1 rounded-lg border border-outline-variant bg-surface-low p-1"
    >
      <Link
        to="/login"
        aria-current={active === "sign-in" ? "page" : undefined}
        className={itemClass(active === "sign-in")}
      >
        Sign in
      </Link>
      <Link
        to="/sign-up"
        aria-current={active === "sign-up" ? "page" : undefined}
        className={itemClass(active === "sign-up")}
      >
        Sign up
      </Link>
    </nav>
  );
}
