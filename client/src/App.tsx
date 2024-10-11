import Auth from "./pages/auth";
import Home from "./pages/home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";

const App = () => {
  return (
    <ThemeProvider storageKey="theme">
      <ModeToggle />
      <Router>
        <Routes>
          {!localStorage.getItem("token") ||
          localStorage.getItem("token") === "undefined" ? (
            <>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
            </>
          ) : (
            <Route path="/" element={<Home />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
