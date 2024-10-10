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
import axios from "axios";
import { useState } from "react";

const Auth = () => {
  const [formData, setFormData] = useState({
    name: "",
    loginEmail: "",
    loginPassword: "",
    signupEmail: "",
    signupPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const makeRequest = async (url: string, data: object) => {
    try {
      const response = await axios.post(url, data);
      console.log(response.data.message);
    } catch (error) {
      console.error("Error during API request:", error);
    }
  };

  const handleSignup = () => {
    makeRequest("http://127.0.0.1:8080/addUser", {
      name: formData.name,
      email: formData.signupEmail,
      password: formData.signupPassword,
    });
  };

  const handleLogin = () => {
    makeRequest("http://127.0.0.1:8080/login", {
      email: formData.loginEmail,
      password: formData.loginPassword,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs
        defaultValue={
          location.pathname === "/login" && "login" ? "login" : "signup"
        }
        className="w-[360px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Welcome back to Quiz App!</CardDescription>
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
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create your account to start playing quizzes!
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
              <Button onClick={handleSignup} className="w-full">
                Signup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
