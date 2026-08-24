import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHub } from "@/lib/store";

export const Route = createFileRoute("/access")({ component: Access });

function Access() {
  const startPreview = useHub((s) => s.startPreview);
  const subscribe = useHub((s) => s.subscribe);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [org, setOrg] = useState("");

  return (
    <AppShell>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Regional Planning Access
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Secure entry for municipal officials, developers, and coordinators</h1>
          <p className="mt-3 text-muted-foreground">
            Explore the platform with full access for 5 minutes before committing to a subscription.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              startPreview();
              toast.success("Preview started — 5 minutes");
              nav({ to: "/map" });
            }}
          >
            Start One-Time Trial
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="in">
              <TabsList>
                <TabsTrigger value="in">Sign In</TabsTrigger>
                <TabsTrigger value="reg">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="in" className="mt-4 space-y-3">
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Label>Password</Label>
                <Input type="password" defaultValue="" />
                <Button
                  className="w-full"
                  onClick={() => {
                    subscribe({
                      firstName: "Sarah",
                      lastName: "Jenkins",
                      email: email || "s.jenkins@county.gov",
                      org: "York County Planning",
                    });
                    toast.success("Signed in");
                    nav({ to: "/dashboard" });
                  }}
                >
                  Authenticate Access
                </Button>
              </TabsContent>
              <TabsContent value="reg" className="mt-4 space-y-3">
                <Label>First Name</Label>
                <Input value={first} onChange={(e) => setFirst(e.target.value)} />
                <Label>Last Name</Label>
                <Input value={last} onChange={(e) => setLast(e.target.value)} />
                <Label>Municipality / Organization</Label>
                <Input value={org} onChange={(e) => setOrg(e.target.value)} />
                <Label>Work Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button
                  className="w-full"
                  onClick={() => {
                    subscribe({
                      firstName: first || "Planner",
                      lastName: last || "Account",
                      email: email || "planner@susquehanna.gov",
                      org: org || "Municipality",
                    });
                    toast.success("Credentials issued");
                    nav({ to: "/dashboard" });
                  }}
                >
                  Request Credentials
                </Button>
              </TabsContent>
            </Tabs>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Need the full platform?{" "}
              <Link to="/subscription" className="underline">
                View Pro
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
