import { Home, LayoutDashboard, CalendarCheck, User, Heart, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Appointments", url: "/appointments", icon: CalendarCheck },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="hospital-gradient rounded-lg p-1.5 shrink-0">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground group-data-[collapsible=icon]:hidden">
            MediCare
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="text-xs text-muted-foreground truncate mb-2 group-data-[collapsible=icon]:hidden">
          {user?.email}
        </div>
        <Button
        className="border border-blue text-blue-900 bg-transparent 
             hover:bg-primary hover:text-white 
             transition-all duration-100
             flex items-center gap-1 px-4 py-3 rounded-lg"
          size="sm"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
