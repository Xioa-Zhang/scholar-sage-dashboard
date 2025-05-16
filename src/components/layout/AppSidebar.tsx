
import { CalendarClock, CalendarDays, List, ListChecks } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type SidebarItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

const learningItems: SidebarItem[] = [
  {
    title: "Subjects",
    path: "/learning/subjects",
    icon: List,
  },
  {
    title: "Study Planner",
    path: "/learning/study-planner",
    icon: CalendarClock,
  },
  {
    title: "Notes",
    path: "/learning/notes",
    icon: ListChecks,
  },
  {
    title: "Flashcards",
    path: "/learning/flashcards",
    icon: List,
  },
];

const taskItems: SidebarItem[] = [
  {
    title: "Calendar",
    path: "/tasks/calendar",
    icon: CalendarDays,
  },
  {
    title: "Todo List",
    path: "/tasks/todo",
    icon: ListChecks,
  },
  {
    title: "Progress Tracker",
    path: "/tasks/progress",
    icon: List,
  },
];

const competitionItems: SidebarItem[] = [
  {
    title: "Events",
    path: "/competitions/events",
    icon: CalendarDays,
  },
  {
    title: "Countdown",
    path: "/competitions/countdown",
    icon: List,
  },
];

const fileItems: SidebarItem[] = [
  {
    title: "Files",
    path: "/files/browser",
    icon: List,
  },
  {
    title: "Sync Settings",
    path: "/files/sync",
    icon: List,
  },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader className="text-xl font-bold p-4">
        Scholar Dashboard
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {taskItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Competitions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {competitionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title="Toggle theme"
          className="w-full"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="ml-2">Toggle {theme === "light" ? "Dark" : "Light"} Mode</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
