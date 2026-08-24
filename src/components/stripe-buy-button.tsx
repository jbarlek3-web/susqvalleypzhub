import { useEffect, useRef, useState } from "react";
import { STRIPE } from "@/lib/stripe";

export function StripeBuyButton() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${STRIPE.scriptSrc}"]`,
    );
    if (customElements.get("stripe-buy-button")) {
      setReady(true);
      return;
    }
    const script =
      existing ??
      Object.assign(document.createElement("script"), {
        src: STRIPE.scriptSrc,
        async: true,
      });
    const onLoad = () => setReady(true);
    script.addEventListener("load", onLoad);
    if (!existing) document.body.appendChild(script);
    if (customElements.get("stripe-buy-button")) setReady(true);
    return () => script.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!ready || !host) return;
    host.replaceChildren();
    const button = document.createElement("stripe-buy-button");
    button.setAttribute("buy-button-id", STRIPE.buyButtonId);
    button.setAttribute("publishable-key", STRIPE.publishableKey);
    host.appendChild(button);
  }, [ready]);

  return (
    <div className="relative flex min-h-12 w-full justify-center">
      <div ref={hostRef} className={ready ? "w-full max-w-sm" : "sr-only"} />
      {!ready && <div className="h-12 w-full max-w-sm animate-pulse rounded-md bg-muted" aria-hidden />}
    </div>
  );
}
