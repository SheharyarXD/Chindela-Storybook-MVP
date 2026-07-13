import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpcClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    requestReset.mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {requestReset.isSuccess ? (
            <p className="text-sm text-gray-600 text-center">
              If an account exists for that email, we've sent a password reset link. Check your inbox.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
              />
              <Button className="w-full" disabled={requestReset.isPending}>
                {requestReset.isPending ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
          <Button variant="link" className="w-full mt-2" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
