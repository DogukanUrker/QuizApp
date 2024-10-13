import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Spinner from "@/components/loading-spinner.tsx";

const Home = () => {
  const [loading, setLoading] = useState(false); // Loading state
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const joinRoomDialog = () => {
    setShowJoinDialog(true);
  };

  const createRoomDialog = () => {
    setShowCreateDialog(true);
  };

  const joinRoom = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    try {
      const response = await axios.post(
        "http://192.168.6.31:8080/joinRoom",
        {
          roomCode: (document.getElementById("room-code") as HTMLInputElement)
            ?.value,
          name: name,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        console.log(response.data);
        localStorage.setItem("room", JSON.stringify(response.data));
        window.location.href = "/room/" + response.data.room.code;
      }
    } catch (error) {
      console.error("Error during join room request:", error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    try {
      const response = await axios.post(
        "http://192.168.6.31:8080/createRoom",
        {
          name: (document.getElementById("room-name") as HTMLInputElement)
            ?.value,
          userName: name,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        console.log(response.data);
        localStorage.setItem("room", JSON.stringify(response.data));
        window.location.href = "/room/" + response.data.room.code;
      }
    } catch (error) {
      console.error("Error during create room request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={createRoomDialog}>Create Room</Button>
      <Button onClick={joinRoomDialog}>Join Room</Button>
      <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Join Room</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Please enter the room code
          </AlertDialogDescription>
          <Input
            id="room-code"
            placeholder="Room code"
            type="text"
            autoComplete="off"
            required
          ></Input>
          <AlertDialogFooter>
            <Button onClick={joinRoom} disabled={loading}>
              {loading ? <Spinner content="Join" /> : "Join"}
            </Button>
            <AlertDialogAction onClick={() => setShowJoinDialog(false)}>
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Room</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to create a new room?
          </AlertDialogDescription>
          <Input
            id="room-name"
            placeholder="Room name"
            type="text"
            autoComplete="off"
            required
          ></Input>
          <AlertDialogFooter>
            <Button onClick={createRoom} disabled={loading}>
              {loading ? <Spinner content="Create" /> : "Create"}
            </Button>
            <AlertDialogAction onClick={() => setShowCreateDialog(false)}>
              Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
