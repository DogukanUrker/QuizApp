import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import LogoutButton from "@/components/logout-button.tsx";
import { UserRound } from "lucide-react";

export function Profile() {
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
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </>
  );
}

export default Profile;
