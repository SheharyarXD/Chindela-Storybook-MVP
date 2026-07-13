import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpcClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const resetPassword = trpc.auth.resetPassword.useMutation({
    onError: (e) => setError(e.message),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    resetPassword.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center text-sm text-gray-600">
            This reset link is missing its token. Please use the link from your email, or{" "}
            <Link to="/forgot-password" className="text-amber-600 hover:underline">request a new one</Link>.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {resetPassword.isSuccess ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">Your password has been reset. Please sign in again.</p>
              <Button className="w-full" onClick={() => navigate("/login")}>Go to sign in</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="New password (12+ characters)"
                autoComplete="new-password"
                minLength={12}
                required
              />
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={12}
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
