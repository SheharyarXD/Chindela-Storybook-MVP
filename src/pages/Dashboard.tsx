import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpcClient";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Users,
  BookOpen,
  TrendingUp,
  Sparkles,
  Plus,
  CreditCard,
  Bell,
  ArrowRight,
  Star,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { data: children } = trpc.child.list.useQuery();
  const { data: ageGroups } = trpc.ageGroup.list.useQuery();
  const { data: subs } = trpc.subscription.list.useQuery();
  const { data: notifications } = trpc.notification.list.useQuery();
  const utils = trpc.useUtils();

  const [isOpen, setIsOpen] = useState(false);
  const [childForm, setChildForm] = useState({
    name: "",
    pin: "",
    ageGroupId: "",
    age: "",
  });

  const createChild = trpc.child.create.useMutation({
    onSuccess: () => {
      utils.child.list.invalidate();
      setIsOpen(false);
      setChildForm({ name: "", pin: "", ageGroupId: "", age: "" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  const activeSubs = subs?.filter((s) => s.status === "active") || [];
  const unreadNotifs = notifications?.filter((n) => !n.isRead) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0] || "Parent"}!
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your children's learning journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Children"
              value={children?.length || 0}
              icon={Users}
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <StatCard
              label="Active Subscriptions"
              value={activeSubs.length}
              icon={CreditCard}
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <StatCard
              label="Unread Notifications"
              value={unreadNotifs.length}
              icon={Bell}
              color="text-amber-500"
              bg="bg-amber-50"
            />
            <StatCard
              label="Total Entries"
              value={children?.reduce((sum, c) => sum + (c.totalEntries || 0), 0) || 0}
              icon={BookOpen}
              color="text-purple-500"
              bg="bg-purple-50"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Children Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Children</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a Child</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Child's Name</Label>
                        <Input
                          value={childForm.name}
                          onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                          placeholder="e.g., Emma"
                        />
                      </div>
                      <div>
                        <Label>4-Digit PIN</Label>
                        <Input
                          type="password"
                          maxLength={4}
                          value={childForm.pin}
                          onChange={(e) => setChildForm({ ...childForm, pin: e.target.value.replace(/\D/g, "") })}
                          placeholder="****"
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          type="number"
                          min={3}
                          max={99}
                          value={childForm.age}
                          onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
                          placeholder="Age in years"
                        />
                      </div>
                      <div>
                        <Label>Age Group</Label>
                        <Select
                          value={childForm.ageGroupId}
                          onValueChange={(v) => setChildForm({ ...childForm, ageGroupId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups?.map((ag) => (
                              <SelectItem key={ag.id} value={ag.id.toString()}>
                                {ag.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() =>
                          createChild.mutate({
                            name: childForm.name,
                            pin: childForm.pin,
                            ageGroupId: parseInt(childForm.ageGroupId),
                            age: parseInt(childForm.age),
                          })
                        }
                        disabled={!childForm.name || childForm.pin.length !== 4 || !childForm.ageGroupId || !childForm.age}
                        className="w-full"
                      >
                        Add Child
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {children?.length === 0 && (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h3>
                  <p className="text-gray-500 mb-4">Add your first child to get started</p>
                  <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {children?.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
                <div className="space-y-3">
                  {notifications?.slice(0, 5).map((notif) => (
                    <Card key={notif.id} className={notif.isRead ? "opacity-70" : ""}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notif.type === "diary_entry" ? "bg-purple-100" :
                          notif.type === "ai_feedback" ? "bg-blue-100" :
                          notif.type === "subscription_expiry" ? "bg-amber-100" :
                          "bg-gray-100"
                        }`}>
                          <Bell className={`h-4 w-4 ${
                            notif.type === "diary_entry" ? "text-purple-500" :
                            notif.type === "ai_feedback" ? "text-blue-500" :
                            notif.type === "subscription_expiry" ? "text-amber-500" :
                            "text-gray-500"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-500">{notif.message}</p>
                        </div>
                        {!notif.isRead && <Badge variant="default" className="bg-amber-500">New</Badge>}
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No notifications yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/stories">
                    <Button variant="outline" className="w-full justify-between">
                      Browse Stories
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/diary">
                    <Button variant="outline" className="w-full justify-between">
                      View Diary
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/subscriptions">
                    <Button variant="outline" className="w-full justify-between">
                      Manage Subscriptions
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/account-security">
                    <Button variant="outline" className="w-full justify-between">
                      Account & Security
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subs?.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">No active subscriptions</p>
                      <Link to="/subscriptions">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                          Subscribe Now
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subs?.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div>
                            <p className="text-sm font-medium">{sub.child?.name}</p>
                            <p className="text-xs text-gray-500">{sub.ageGroup?.name}</p>
                          </div>
                          <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                            {sub.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChildCardProps {
  id: number;
  name: string;
  avatar?: string | null;
  age: number;
  isActive: boolean;
  totalEntries?: number | null;
  streakDays?: number | null;
  ageGroup?: { name: string } | null;
}

function ChildCard({ child }: { child: ChildCardProps }) {
  const colorMap: Record<string, string> = {
    "3-4 years": "from-pink-400 to-rose-400",
    "5-7 years": "from-green-400 to-emerald-400",
    "8-10 years": "from-blue-400 to-cyan-400",
    "11-13 years": "from-purple-400 to-violet-400",
    "14-16 years": "from-amber-400 to-orange-400",
    "18+": "from-gray-400 to-slate-400",
  };

  const { data: progress } = trpc.progress.byChild.useQuery({ childId: child.id });
  const completedStories = progress?.filter((p) => p.isCompleted).length ?? 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${colorMap[child.ageGroup?.name] || "from-amber-400 to-orange-400"}`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {child.avatar ? (
              <img src={child.avatar} alt={child.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                {child.name?.[0]}
              </div>
            )}
            <div>
              <h3 className="font-semibold">{child.name}</h3>
              <p className="text-xs text-gray-500">{child.ageGroup?.name} | {child.age} years old</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Child Login ID: <span className="font-mono font-semibold text-gray-600">{child.id}</span>
              </p>
            </div>
          </div>
          <Badge variant={child.isActive ? "default" : "secondary"} className="bg-green-500">
            {child.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <BookOpen className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{child.totalEntries || 0}</p>
            <p className="text-[10px] text-gray-500">Entries</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <TrendingUp className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{child.streakDays || 0}</p>
            <p className="text-[10px] text-gray-500">Streak</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Star className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{completedStories}</p>
            <p className="text-[10px] text-gray-500">Stories</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-50">
            <Calendar className="h-4 w-4 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{child.age}</p>
            <p className="text-[10px] text-gray-500">Age</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/diary?child=${child.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View Diary</Button>
          </Link>
          <Link to="/subscriptions" className="flex-1">
            <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600">Subscribe</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
