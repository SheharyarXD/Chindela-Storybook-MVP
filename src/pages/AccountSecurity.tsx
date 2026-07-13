import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpcClient";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShieldCheck, Monitor, LogOut, MailCheck } from "lucide-react";

export default function AccountSecurity() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: sessions } = trpc.auth.mySessions.useQuery();

  const resendVerification = trpc.auth.resendVerification.useMutation();
  const revokeSession = trpc.auth.revokeSession.useMutation({ onSuccess: () => utils.auth.mySessions.invalidate() });
  const logoutAll = trpc.auth.logoutAll.useMutation({ onSuccess: () => (window.location.href = "/login") });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account & Security</h1>
            <p className="text-gray-500">Manage your login sessions and account safety</p>
          </div>

          {user && !user.emailVerifiedAt && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MailCheck className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Your email isn't verified yet</p>
                    <p className="text-xs text-amber-700">Check your inbox, or resend the verification link.</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resendVerification.isPending || resendVerification.isSuccess}
                  onClick={() => resendVerification.mutate()}
                >
                  {resendVerification.isSuccess ? "Sent!" : resendVerification.isPending ? "Sending…" : "Resend"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-amber-500" />
                Active sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions?.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {s.userAgent ? s.userAgent.slice(0, 60) : "Unknown device"}
                      {s.isCurrent && <Badge variant="default" className="bg-emerald-500">This device</Badge>}
                      {s.rememberMe && <Badge variant="outline">Remembered</Badge>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.ipAddress ?? "Unknown IP"} · last active {new Date(s.lastSeenAt).toLocaleString()}
                    </p>
                  </div>
                  {!s.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession.mutate({ id: s.id })}
                      aria-label="Sign out this device"
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              )) || <p className="text-sm text-gray-500 text-center py-4">No active sessions found.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Sign out everywhere
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                This will sign you out of every device, including this one. You'll need to sign in again.
              </p>
              <Button variant="destructive" onClick={() => logoutAll.mutate()} disabled={logoutAll.isPending}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out of all devices
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
