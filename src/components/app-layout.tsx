"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// फालतू आइकॉन (Crown, StickyNote, Lock) हटा दिए गए हैं 
import {
  BookText,
  LayoutDashboard,
  Smile,
  Heart,
  Stethoscope,
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
import { Logo } from "./icons";
import { Separator } from "./ui/separator";

// 2. Sticker Store और 3. The Vault यहाँ से डिलीट कर दिए हैं
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
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        {/* 4. Go Premium बटन यहाँ से डिलीट कर दिया है */}
        <SidebarFooter className="p-4">
           <Separator className="mb-4" />
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