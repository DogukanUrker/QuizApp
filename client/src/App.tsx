import Auth from "./pages/auth";
import Home from "./pages/home";
import Room from "@/pages/room.tsx";
import NotFound from "@/pages/404.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import Profile from "@/components/profile.tsx";
import { Toaster } from "sonner";
import ManageRoom from "@/pages/manageRoom.tsx";
import { Button } from "@/components/ui/button.tsx";
import { House } from "lucide-react";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <ThemeProvider storageKey="theme">
      <div className="absolute top-2 right-2 flex ">
        {token && token !== "undefined" && <Profile />}
        <ModeToggle />
      </div>
      {!token || token === "undefined" ? (
        <div className={"absolute top-2 left-2"}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (window.location.href = "/")}
          >
            <House className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Home</span>
          </Button>
        </div>
      ) : null}
      <Router>
        <Routes>
          {!token || token === "undefined" ? (
            <>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomCode/manage" element={<ManageRoom />} />
            </>
          )}
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
