import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { currentEntitlement } from "@/lib/entitlement.server";

export const getEntitlement = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(() => currentEntitlement());
