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

interface RoomData {
  room: {
    name: string;
    code: string;
    owner: {
      name: string;
    };
    members: { name: string }[];
  };
}

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          "http://192.168.6.31:8080/room",
          { roomCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setRoomData(response.data);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
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
        <div>
          <div className="mb-2">
            <Label className="block">Name</Label>
            <p className="text-xl">{roomData?.room.name}</p>
          </div>
          <div className="mb-2">
            <Label className="block">Code</Label>
            <div className="flex items-stretch" onClick={handleCopyCode}>
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
          <div className="mb-2">
            <Label className="block">Owner</Label>
            <p className="text-xl">
              {roomData?.room.owner.name.replace(/"/g, "")}
            </p>
          </div>
          <ScrollArea className="h-72 w-48 rounded-md border">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">Members</h4>
              {roomData?.room.members.map((member) => (
                <>
                  <div className="text-sm">{member.name.replace(/"/g, "")}</div>
                  <Separator className="my-2" />
                </>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default Room;
