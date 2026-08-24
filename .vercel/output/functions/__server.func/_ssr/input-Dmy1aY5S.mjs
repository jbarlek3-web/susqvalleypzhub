import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { y as cn } from "./app-shell-9N-sEoVp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-Dmy1aY5S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	autoComplete: props.autoComplete ?? "off",
	suppressHydrationWarning: true,
	className: cn("flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-on-surface shadow-none placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
//#endregion
export { Input as t };
