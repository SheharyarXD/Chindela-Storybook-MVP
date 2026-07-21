import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sprout,
  LayoutDashboard,
  LogOut,
  Bell,
  Users,
  CreditCard,
  Shield,
  ShieldCheck,
  Baby,
  Menu,
  BookOpenText,
} from "lucide-react";
import { trpc } from "@/providers/trpcClient";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  const isAdmin = user?.role === "admin";

  const navItems = isAdmin
    ? [{ label: "Admin", path: "/admin", icon: Shield }]
    : [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Stories", path: "/stories", icon: BookOpenText },
        { label: "Diary", path: "/diary", icon: Sprout },
        { label: "Subscription", path: "/subscriptions", icon: CreditCard },
      ];

  const NavLink = ({ item }: { item: (typeof navItems)[number] }) => {
    const active = location.pathname === item.path;
    return (
      <Link key={item.path} to={item.path} className="relative">
        <span
          className={cn(
            "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </span>
        {active && (
          <motion.span
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-full bg-primary shadow-soft"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-2">
        <Link to="/" className="flex items-center gap-2 mr-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold text-primary">
            Chindela
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1 ml-auto">
          {!isAdmin && (
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                {unreadCount ? unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          )}

          <Link to="/child-login">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full">
              <Baby className="h-4 w-4 text-success" />
              Child Login
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-2 pl-3 border-l border-border/60 rounded-full py-1 pr-1 hover:bg-muted transition-colors">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Users className="h-4 w-4" />
                  </span>
                )}
                <span className="text-sm font-medium">{user?.name || "User"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.name || "Your account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/account-security" className="cursor-pointer">
                    <ShieldCheck className="h-4 w-4" />
                    Account &amp; Security
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={logout} className="cursor-pointer">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex md:hidden items-center gap-1 ml-auto">
          {!isAdmin && (
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                {unreadCount ? unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-display flex items-center gap-2 text-primary">
                  <Sprout className="h-5 w-5" />
                  Chindela
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/80 hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/child-login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  <Baby className="h-4 w-4 text-success" />
                  Child Login
                </Link>
                {!isAdmin && (
                  <Link
                    to="/account-security"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Account &amp; Security
                  </Link>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 px-4 py-4">
                <div className="flex items-center gap-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Users className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-sm font-medium">{user?.name || "User"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
