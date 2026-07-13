import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Home,
  LayoutDashboard,
  LogOut,
  Bell,
  Users,
  CreditCard,
  Shield,
  Baby,
} from "lucide-react";
import { trpc } from "@/providers/trpcClient";

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  const isAdmin = user?.role === "admin";

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    ...(isAdmin
      ? [{ label: "Admin", path: "/admin", icon: Shield }]
      : [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Stories", path: "/stories", icon: BookOpen },
          { label: "Diary", path: "/diary", icon: BookOpen },
          { label: "Subscriptions", path: "/subscriptions", icon: CreditCard },
        ]),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <BookOpen className="h-6 w-6 text-amber-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Chindela
          </span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount ? unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          )}

          <Link to="/child-login">
            <Button variant="ghost" size="sm" className="gap-2">
              <Baby className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">Child Login</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Users className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium hidden md:inline">{user?.name || "User"}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
