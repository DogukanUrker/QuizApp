import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

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
    <>
      <h1>{message}</h1>
    </>
  );
}

export default App;
