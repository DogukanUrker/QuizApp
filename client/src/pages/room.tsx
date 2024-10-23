import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "@/components/loading-spinner.tsx";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";
import { apiURL } from "@/constans.ts";

interface RoomData {
  room: {
    name: string;
    code: string;
    owner: {
      name: string;
      email: string;
    };
    members: { name: string; email: string }[];
  };
}

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingRoom, setExitingRoom] = useState(false);
  const [exitedRoom, setExitedRoom] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      const email = localStorage.getItem("userEmail");
      try {
        const response = await axios.post(
          apiURL + "room",
          {
            roomCode: roomCode,
            email: email,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setRoomData(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          toast.error("Failed to fetch room data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomCode]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          apiURL + "loadUsers",
          { roomCode },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setRoomData((prevData) => ({
          ...prevData,
          room: {
            ...prevData?.room,
            members: response.data.users,
          },
        }));
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error("Failed to fetch users.");
        }
      }
    };

    const intervalId = setInterval(fetchUsers, 3000);
    return () => clearInterval(intervalId);
  }, [roomCode]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner content="Room content is loading." />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error: {error}</p>
      </div>
    );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomData?.room.code || "");
    toast.success(`Room code copied to clipboard: ${roomData?.room.code}`);
  };

  const handleExitRoom = async () => {
    const email = localStorage.getItem("userEmail");
    setExitingRoom(true);
    try {
      await axios.post(
        apiURL + "exitRoom",
        {
          roomCode: roomCode,
          email: email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Successfully exited the room.");
      setExitedRoom(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.pathname = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Failed to exit the room.");
      }
    } finally {
      setExitingRoom(false);
    }
  };

  return (
    <>
      {localStorage.getItem("userEmail") === roomData?.room.owner.email && (
        <div className="absolute left-2 top-2">
          <Button
            variant={"ghost"}
            onClick={() =>
              (window.location.pathname = `/room/${roomCode}/manage`)
            }
          >
            Edit Room
          </Button>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <Label className="block">Name</Label>
            <p className="text-xl font-semibold">{roomData?.room.name}</p>
          </div>
          <div className="mb-4">
            <Label className="block">Code</Label>
            <div className="flex items-center" onClick={handleCopyCode}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xl cursor-pointer">
                      {roomData?.room.code}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="mb-4">
            <Label className="block">Owner</Label>
            <p className="text-xl font-semibold">
              {roomData?.room.owner.name.replace(/"/g, "")}
            </p>
          </div>
          <ScrollArea className="h-72 w-64 rounded-md border p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">
              {roomData?.room.members.length} Members
            </h4>
            {roomData?.room.members.map((member) => (
              <div key={member.email} className="mb-2">
                <div className="text-sm">{member.name.replace(/"/g, "")}</div>
                <Separator className="my-2" />
              </div>
            ))}
          </ScrollArea>
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Exit Room</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Exit Room</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to exit this room? You can rejoin at
                    any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button onClick={handleExitRoom} disabled={exitingRoom}>
                    {exitingRoom ? (
                      <Spinner content="Exiting..." />
                    ) : exitedRoom ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "Exit"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default Room;
