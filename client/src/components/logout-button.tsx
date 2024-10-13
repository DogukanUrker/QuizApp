import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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

  return (
    <Button variant="ghost" className="p-0 m-0 w-fit" onClick={handleLogout}>
      <LogOut className={"h-[1.2rem] w-[1.2rem] mr-2"} /> Logout
    </Button>
  );
};

export default LogoutButton;
