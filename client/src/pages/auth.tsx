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

  const [loading, setLoading] = useState(false); // Loading state
  const [activeTab, setActiveTab] = useState("signup"); // Active tab state
  const [showDialog, setShowDialog] = useState(false); // Dialog state

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
            <CardFooter>
              <Button
                onClick={handleLogin}
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner content="Login" /> : "Login"}
              </Button>
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
            <CardFooter>
              <Button
                onClick={handleSignup}
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner content="Signup" /> : "Signup"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
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
