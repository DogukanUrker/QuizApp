import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "@/components/loading-spinner.tsx";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Check,
  Clock,
  Copy,
  Crown,
  DoorOpen,
  GamepadIcon,
  ListOrdered,
  Settings,
  Users,
} from "lucide-react";
import { apiURL } from "@/constans.ts";
import { Badge } from "@/components/ui/badge";

interface RoomData {
  room: {
    name: string;
    code: string;
    owner: {
      name: string;
      email: string;
    };
    members: { name: string; email: string }[];
    gameStarted?: boolean;
  };
}

const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingRoom, setExitingRoom] = useState(false);
  const [exitedRoom, setExitedRoom] = useState(false);
  const [gameStatus, setGameStatus] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      const email = localStorage.getItem("userEmail");
      try {
        const response = await axios.post(
          apiURL + "Room",
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
          apiURL + "loadUsersRoom",
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
            name: prevData?.room.name || "", // Ensure name is always a string
            code: prevData?.room.code || "", // Ensure code is always a string
            owner: prevData?.room.owner,
            gameStarted: prevData?.room.gameStarted,
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

  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const response = await axios.post(
          apiURL + "getGameStatus",
          { roomCode },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setGameStatus(response.data.gameStarted);
        if (response.data.gameStarted === true) {
          window.location.pathname = `/game/${roomCode}/1`;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error("Failed to fetch game status.");
        }
      }
    };

    const intervalId = setInterval(fetchGameStatus, 3000);
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
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
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

  document.title = roomData.room.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8 flex items-center justify-center md:mt-0 mt-2">
      <div className="md:w-10/12 mx-auto w-full">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold">
                  {roomData?.room.name}
                </CardTitle>
                <CardDescription>Welcome to the game room!</CardDescription>
              </div>
              {localStorage.getItem("userEmail") ===
                roomData?.room.owner.email && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    (window.location.pathname = `/room/${roomCode}/manage`)
                  }
                >
                  <Settings className="h-4 w-4" />
                  Manage Room
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Alert variant={gameStatus ? "default" : "default"}>
                <div className="flex items-center gap-2">
                  {gameStatus ? (
                    <GamepadIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                  <AlertTitle>
                    {gameStatus
                      ? "Game in Progress"
                      : "Waiting for Game to Start"}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {gameStatus
                    ? "The game has started! You'll be redirected to the game page..."
                    : "Waiting for the room owner to start the game."}
                </AlertDescription>
              </Alert>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Room Code
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-2 gap-2"
                          onClick={handleCopyCode}
                        >
                          <Copy className="h-4 w-4" />
                          {roomData?.room.code}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy room code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Room Owner
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      {roomData?.room.owner.name.replace(/'/g, "")}
                    </span>
                  </div>
                </div>
                <Button
                  className={"w-full gap-2"}
                  onClick={() =>
                    window.open("/leaderboard/" + roomCode, "_blank")
                  }
                >
                  <ListOrdered className="h-4 w-4" />
                  Leaderboard
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <DoorOpen className="h-4 w-4" />
                      Exit Room
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Exit Room</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to exit this room? You can rejoin
                        at any time.
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
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5" />
                  <Label>Members ({roomData?.room.members.length})</Label>
                </div>
                <Card>
                  <ScrollArea className="h-[300px] w-full">
                    <div className="p-4">
                      {roomData?.room.members.map((member, index) => (
                        <React.Fragment key={member.email || index}>
                          <div className="flex items-center justify-between py-3 px-2 hover:bg-accent/50 rounded-md transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {typeof member === "object" ? member : member}
                              </span>
                              {(typeof member === "object"
                                ? member.email === roomData.room.owner.email
                                : member === roomData.room.owner.email) && (
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                >
                                  Owner
                                </Badge>
                              )}
                            </div>
                          </div>
                          {index < roomData.room.members.length - 1 && (
                            <Separator className="my-1" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Room;
