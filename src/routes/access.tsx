import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/access")({ component: AccessRedirect });

function AccessRedirect() {
  return <Navigate to="/login" replace />;
}
