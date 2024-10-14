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

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <ThemeProvider storageKey="theme">
      <div className="absolute top-2 right-2 flex ">
        {token && token !== "undefined" && <Profile />}
        <ModeToggle />
      </div>
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
              <Route path="/room/:roomCode" element={<Room />} />
              <Route path="/room/:roomCode/manage" element={<ManageRoom />} />
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
