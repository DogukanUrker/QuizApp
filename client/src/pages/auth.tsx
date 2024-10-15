import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/loading-spinner.tsx";

const Auth = () => {
  const [formData, setFormData] = useState({
    name: "",
    loginEmail: "",
    loginPassword: "",
    signupEmail: "",
    signupPassword: "",
  });

  const [activeTab, setActiveTab] = useState("signup"); // Active tab state
  const [showDialog, setShowDialog] = useState(false); // Dialog state
  const [loading, setLoading] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const joinRoomDialog = () => {
    setShowJoinDialog(true);
  };

  const joinRoom = async () => {
    setLoading(true);
    const nameElement = document.getElementById("username") as HTMLInputElement;
    const name = nameElement?.value;

    try {
      const response = await axios.post(
        "http://192.168.6.31:8080/joinGuest",
        {
          roomCode: (document.getElementById("room-code") as HTMLInputElement)
            ?.value,
          name: name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        console.log(response.data);
        localStorage.setItem("room", JSON.stringify(response.data));
        localStorage.setItem("userName", name || "Guest");
        localStorage.setItem("userEmail", "guest@app.com");
        window.location.href = "/room/" + response.data.room.code;
      }
    } catch (error) {
      console.error("Error during join room request:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/login") {
      setActiveTab("login");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://192.168.6.31:8080/addUser", {
        name: formData.name,
        email: formData.signupEmail,
        password: formData.signupPassword,
      });

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        console.log(response.data);
        setActiveTab("login"); // Set active tab to login after signup
        setShowDialog(true); // Show dialog
      }
    } catch (error) {
      console.error("Error during signup request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://192.168.6.31:8080/login", {
        email: formData.loginEmail,
        password: formData.loginPassword,
      });

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        console.log(response.data);
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem(
          "userName",
          JSON.stringify(response.data.user.name),
        );
        localStorage.setItem(
          "userEmail",
          JSON.stringify(response.data.user.email),
        );
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during login request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-[365px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Sign in to Quiz App</CardTitle>
              <CardDescription>
                Welcome back! Please sign in to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="loginEmail">Email</Label>
                <Input id="loginEmail" onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col">
              <Button
                onClick={handleLogin}
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner content="Login" /> : "Login"}
              </Button>
              <div className={"text-sm"}>
                Don`t want to login?
                <Button onClick={joinRoomDialog} variant="link" className="p-1">
                  Continue as guest
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Welcome! Please fill in the details to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signupEmail">Email</Label>
                <Input id="signupEmail" onChange={handleInputChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className={"flex-col"}>
              <Button
                onClick={handleSignup}
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner content="Signup" /> : "Signup"}
              </Button>
              <div className={"text-sm"}>
                Don`t want to signup?
                <Button onClick={joinRoomDialog} variant="link" className="p-1">
                  Continue as guest
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Play as Guest</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Pick a name and enter the room code.
            </AlertDialogDescription>
            <Input
              id="username"
              placeholder="Name"
              type="text"
              autoComplete="off"
              required
              className="mt-2"
            />
            <Input
              id="room-code"
              placeholder="Room code"
              type="text"
              autoComplete="off"
              required
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowJoinDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <Button onClick={joinRoom} disabled={loading}>
                {loading ? <Spinner content="Join" /> : "Join"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Tabs>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Signup Successful</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            You need to login after signup.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDialog(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;
