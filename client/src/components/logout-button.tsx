import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.post(
          "http://192.168.6.31:8080/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        localStorage.removeItem("token");
        window.location.href = "/login";
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
};

export default LogoutButton;
