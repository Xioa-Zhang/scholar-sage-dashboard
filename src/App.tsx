
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Learning pages
import Subjects from "./pages/learning/Subjects";
import Notes from "./pages/learning/Notes";
import Flashcards from "./pages/learning/Flashcards";
import StudyPlanner from "./pages/learning/StudyPlanner";

// Tasks pages
import TodoList from "./pages/tasks/TodoList";
import Calendar from "./pages/tasks/Calendar";
import ProgressTracker from "./pages/tasks/Progress";

// Competitions pages
import Events from "./pages/competitions/Events";
import Countdown from "./pages/competitions/Countdown";

// Files pages
import Browser from "./pages/files/Browser";
import Sync from "./pages/files/Sync";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            
            {/* Learning Routes */}
            <Route path="/learning/subjects" element={<Subjects />} />
            <Route path="/learning/notes" element={<Notes />} />
            <Route path="/learning/flashcards" element={<Flashcards />} />
            <Route path="/learning/study-planner" element={<StudyPlanner />} />
            
            {/* Tasks Routes */}
            <Route path="/tasks/todo" element={<TodoList />} />
            <Route path="/tasks/calendar" element={<Calendar />} />
            <Route path="/tasks/progress" element={<ProgressTracker />} />
            
            {/* Competitions Routes */}
            <Route path="/competitions/events" element={<Events />} />
            <Route path="/competitions/countdown" element={<Countdown />} />
            
            {/* Files Routes */}
            <Route path="/files/browser" element={<Browser />} />
            <Route path="/files/sync" element={<Sync />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
