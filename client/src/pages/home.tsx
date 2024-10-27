import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "@/components/loading-spinner";
import { apiURL } from "@/constans";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home as HomeIcon, Users, X } from "lucide-react";

interface RoomResponse {
  error?: boolean;
  message?: string;
  room: {
    code: string;
    name: string;
  };
}

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userID = localStorage.getItem("userID");

  const handleApiError = (error: unknown) => {
    setError(
      axios.isAxiosError(error) && error.response
        ? error.response.data.error
        : "An unexpected error occurred",
    );
    setLoading(false);
  };

  const joinRoom = async () => {
    setLoading(true);
    setError(null);

    const roomCode = (document.getElementById("room-code") as HTMLInputElement)
      ?.value;

    if (!roomCode) {
      setError("Room code is required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<RoomResponse>(
        `${apiURL}joinRoom`,
        {
          roomCode,
          name: userName,
          email: userEmail,
          userID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        setError(response.data.message || "Failed to join room");
      } else {
        localStorage.setItem("room", JSON.stringify(response.data));
        navigate(`/room/${response.data.room.code}`);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    setLoading(true);
    setError(null);

    const roomName = (document.getElementById("room-name") as HTMLInputElement)
      ?.value;

    if (!roomName) {
      setError("Room name is required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<RoomResponse>(
        `${apiURL}createRoom`,
        {
          name: roomName,
          userName,
          email: userEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        setError(response.data.message || "Failed to create room");
      } else {
        localStorage.setItem("room", JSON.stringify(response.data));
        navigate(`/room/${response.data.room.code}`);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
            Welcome to Quiz App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full flex items-center justify-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            Create Room
          </Button>

          <Button
            onClick={() => setShowJoinDialog(true)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            Join Room
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Room
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Enter the room code to join an existing quiz room.
          </AlertDialogDescription>
          <Input
            id="room-code"
            placeholder="Enter room code"
            type="text"
            autoComplete="off"
            required
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={joinRoom} disabled={loading}>
              {loading ? <Spinner content="Joining..." /> : "Join Room"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Create Room
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Create a new quiz room and invite others to join.
          </AlertDialogDescription>
          <Input
            id="room-name"
            placeholder="Enter room name"
            type="text"
            autoComplete="off"
            required
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={createRoom} disabled={loading}>
              {loading ? <Spinner content="Creating..." /> : "Create Room"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
