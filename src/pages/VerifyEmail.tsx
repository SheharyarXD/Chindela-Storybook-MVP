import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpcClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const verifyEmail = trpc.auth.verifyEmail.useMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verifyEmail.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Email verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {!token && <p className="text-sm text-gray-600">This link is missing its verification token.</p>}
          {token && verifyEmail.isPending && <p className="text-sm text-gray-600">Verifying your email…</p>}
          {verifyEmail.isSuccess && <p className="text-sm text-green-700">Your email has been verified. Thank you!</p>}
          {verifyEmail.isError && <p className="text-sm text-red-600">{verifyEmail.error.message}</p>}
          <Button asChild className="w-full">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
