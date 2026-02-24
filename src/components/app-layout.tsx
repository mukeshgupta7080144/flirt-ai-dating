
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookText,
  Crown,
  LayoutDashboard,
  Smile,
  Heart,
  Stethoscope,
  StickyNote,
  Lock,
  HeartPulse,
  BrainCircuit,
  MessageSquare,
  Text,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Logo } from "./icons";
import { Separator } from "./ui/separator";

const navItems = [
  {
    href: "/",
    label: "Vision Board",
    icon: LayoutDashboard,
  },
  {
    href: "/relationship-insights",
    label: "Relationship Coach",
    icon: Stethoscope,
  },
  {
    href: "/soul-connect",
    label: "Soul Connect",
    icon: BrainCircuit,
  },
  {
    href: "/destiny-card",
    label: "Chat Guide",
    icon: BookText,
  },
  {
    href: "/sticker-store",
    label: "Sticker Store",
    icon: StickyNote,
  },
  {
    href: "/romantic-keyboard",
    label: "30-Day Crush Mission",
    icon: HeartPulse,
  },
  {
    href: "/mood-journal",
    label: "Mood Journal",
    icon: Smile,
  },
  {
    href: "/affirmations",
    label: "Romantic Lines",
    icon: Heart,
  },
  {
    href: "/community",
    label: "Comment",
    icon: MessageSquare,
  },
  {
    href: "/ascii-art",
    label: "ASCII Art",
    icon: Text,
  },
  {
    href: "/vault",
    label: "The Vault",
    icon: Lock,
  },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <h1 className="text-xl font-semibold">Flirt AI</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <Link href={item.href}>
                    <item.icon className={cn(item.label === 'The Vault' && 'text-yellow-500')} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <Separator className="mb-4" />
           <Button variant="outline">
              <Crown className="mr-2 text-yellow-500" />
              Go Premium
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 flex flex-col">
            {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
