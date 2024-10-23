import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { House, LogOut, UserRound } from "lucide-react";
import axios from "axios";
import { apiURL } from "@/constans.ts";

export function Profile() {
  const name: string | null = localStorage.getItem("userName");
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.post(
          apiURL + "logout",
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
    <>
      <DropdownMenu>
        <div>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserRound className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {name ? name.replace(/"/g, "") : "Guest"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={"p-2 mb-1 cursor-pointer"}
              onClick={() => (window.location.href = "/")}
            >
              <House className={"h-[1.2rem] w-[1.2rem] mr-2"} /> Home
            </DropdownMenuItem>
            <DropdownMenuItem
              className={"p-2 mt-1 cursor-pointer"}
              onClick={handleLogout}
            >
              <LogOut className={"h-[1.2rem] w-[1.2rem] mr-2"} /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </>
  );
}

export default Profile;
