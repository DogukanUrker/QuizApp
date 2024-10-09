import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
function App() {
  const [message, setMessage] = useState("");

  const fetchApi = async () => {
    const response = await axios.get("http://127.0.0.1:8080/api");
    setMessage(response.data.message);
  };

  useEffect(() => {
    fetchApi();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModeToggle />
      <h1>{message}</h1>
    </ThemeProvider>
  );
}

export default App;
