import Auth from "./pages/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <ModeToggle />
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
