import React, { useEffect, useState } from "react";
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
import { ArrowRight, Asterisk, Lock, Mail, User } from "lucide-react";
import axios from "axios";
import Spinner from "@/components/loading-spinner";
import { apiURL } from "@/constans";

const Auth = () => {
  const [formData, setFormData] = useState({
    name: "",
    loginEmail: "",
    loginPassword: "",
    signupEmail: "",
    signupPassword: "",
  });

  const [activeTab, setActiveTab] = useState("signup");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

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
      const response = await axios.post(apiURL + "addUser", {
        name: formData.name,
        email: formData.signupEmail,
        password: formData.signupPassword,
      });

      if (response.data.error) {
        console.log(response.data.message);
      } else {
        setActiveTab("login");
        setShowDialog(true);
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
      const response = await axios.post(apiURL + "login", {
        email: formData.loginEmail,
        password: formData.loginPassword,
      });

      if (!response.data.error) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userID", response.data.user.id);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during login request:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    setLoading(true);
    const nameElement = document.getElementById("username") as HTMLInputElement;
    const name = nameElement?.value;

    try {
      const response = await axios.post(
        apiURL + "joinGuest",
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

      if (!response.data.error) {
        localStorage.setItem("room", JSON.stringify(response.data));
        localStorage.setItem("userName", name || "Guest");
        localStorage.setItem("userEmail", "guest@app.com");
        localStorage.setItem("userID", response.data.room.guest.id);
        window.location.href = "/room/" + response.data.room.code;
      }
    } catch (error) {
      console.error("Error during join room request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Quiz App</h1>
          <p className="mt-1 text-sm">GDG on Campus Yaşar University</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  Welcome back
                </CardTitle>
                <CardDescription>
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4" />
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4" />
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button
                  onClick={handleLogin}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner content="Signing in..." />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setShowJoinDialog(true)}
                  >
                    Join as guest
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  Create an account
                </CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4" />
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="pl-10"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4" />
                    <Input
                      id="signupPassword"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button
                  onClick={handleSignup}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner content="Creating account..." />
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setShowJoinDialog(true)}
                  >
                    Join as guest
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold">
                Join as Guest
              </AlertDialogTitle>
              <AlertDialogDescription>
                Enter your name and room code to continue
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4" />
                  <Input
                    id="username"
                    placeholder="Enter your name"
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-code">Room Code</Label>
                <div className={"relative"}>
                  <Asterisk className="absolute left-3 top-3 h-4 w-4" />
                  <Input
                    id="room-code"
                    placeholder="Enter room code"
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={joinRoom} disabled={loading}>
                {loading ? <Spinner content="Joining..." /> : "Join Room"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Account Created Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                Please sign in with your new account credentials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowDialog(false)}>
                Continue to Login
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Auth;
