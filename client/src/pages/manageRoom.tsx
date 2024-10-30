import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/loading-spinner.tsx";
import { useParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiURL } from "@/constans.ts";
import { Check, Copy, ListOrdered, Trash, UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoomData {
  room: {
    name: string;
    code: string;
    owner: {
      email: string;
      name: string;
    };
    members: { name: string; email: string; id: string }[];
    gameStarted: boolean;
  };
}

interface Question {
  id: string;
  question: string;
  answers: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct: string;
  point: number;
  time: number;
}

const ManageRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [answerC, setAnswerC] = useState("");
  const [answerD, setAnswerD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [point, setPoint] = useState(10);
  const [time, setTime] = useState(15);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [banningUserEmail, setBanningUser] = useState<string | null>(null);
  const [bannedUserEmail, setBannedUser] = useState<string | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [endingGame, setEndingGame] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      const token = localStorage.getItem("token");
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
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setRoomData(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        toast.error("Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          apiURL + "getQuestions",
          { roomCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setQuestions(response.data.questions);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
        toast.error("Failed to fetch questions.");
      }
    };

    fetchRoomData();
    fetchQuestions();
  }, [roomCode]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          apiURL + "loadUsers",
          { roomCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        setRoomData((prevData) => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            room: {
              ...prevData.room,
              members: response.data.users,
            },
          };
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Failed to fetch users.");
      }
    };

    const intervalId = setInterval(fetchUsers, 4000);
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

  const handleAddQuestion = async () => {
    if (
      !question ||
      !answerA ||
      !answerB ||
      !answerC ||
      !answerD ||
      !correctAnswer
    ) {
      toast.error("All fields are required.");
      return;
    }

    setAddingQuestion(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "addQuestion",
        {
          roomCode: roomCode,
          question: question,
          answers: {
            a: answerA,
            b: answerB,
            c: answerC,
            d: answerD,
          },
          correct: correctAnswer,
          point: point,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Question added successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error("Failed to add question.");
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setDeletingQuestionId(questionId);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "deleteQuestion",
        {
          questionID: questionId,
          roomCode: roomCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Question deleted successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete question.");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleBanUser = async (id: string) => {
    setBanningUser(id);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "banUser",
        {
          userID: id,
          roomCode: roomCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("User banned successfully.");
      setBannedUser(id);
    } catch (err) {
      console.error("Failed to ban user:", err); // Log the error
      toast.error("Failed to ban user.");
    } finally {
      setBanningUser(null);
    }
  };

  const handleDeleteRoom = async () => {
    setDeletingRoom(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "deleteRoom",
        {
          roomCode: roomCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Room deleted successfully.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete room.");
    } finally {
      setDeletingRoom(false);
    }
  };

  const handleStartGame = async () => {
    setStartingGame(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "startGame",
        {
          roomCode: roomCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Game started successfully.");
      setTimeout(() => {
        window.location.href = "/leaderboard/" + roomCode + "/manage";
      }, 1500);
    } catch (err) {
      toast.error("Failed to start game.");
    } finally {
      setStartingGame(false);
    }
  };

  const handleEndGame = async () => {
    setEndingGame(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        apiURL + "endGame",
        {
          roomCode: roomCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Game ended successfully.");
      setTimeout(() => {
        window.location.href = "/leaderboard/" + roomCode + "/manage";
      }, 1500);
    } catch (err) {
      toast.error("Failed to end game.");
    } finally {
      setEndingGame(false);
    }
  };

  if (localStorage.getItem("userEmail") !== roomData?.room.owner.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unauthorized</p>
      </div>
    );
  }

  document.title = "Manage - " + roomData.room.name;

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {roomData?.room.name}
                </CardTitle>
                <CardDescription>
                  Managed by {roomData?.room.owner.name.replace(/"/g, "")}
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                      {roomData?.room.code}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Click to copy room code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Members Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Players ({roomData?.room.members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {roomData?.room.members.map((member) => (
                      <div key={member.id} className="group">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm">{member.name}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to ban this user?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                  onClick={() => handleBanUser(member.id)}
                                >
                                  {banningUserEmail === member.id ? (
                                    <span className="animate-spin">...</span>
                                  ) : bannedUserEmail === member.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    "Ban"
                                  )}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Game Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="text-center p-4 rounded-lg border">
                      <span className="text-xl font-semibold">
                        {roomData?.room.gameStarted
                          ? "Game in Progress"
                          : "Waiting to Start"}
                      </span>
                    </div>
                    {roomData?.room.gameStarted ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            End Game
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>End the Game</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to end the game?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              onClick={handleEndGame}
                              disabled={endingGame}
                            >
                              {endingGame ? "Ending..." : "End Game"}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full">Start Game</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Start the Game</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to start the game?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button
                              onClick={handleStartGame}
                              disabled={startingGame}
                            >
                              {startingGame ? "Starting..." : "Start Game"}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Questions ({questions.length})
              </CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Add Question</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Add New Question</AlertDialogTitle>
                    <AlertDialogDescription>
                      Fill out the details for your new question
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={point}
                        onChange={(e) => setPoint(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time (seconds)</Label>
                      <Input
                        type="number"
                        value={time}
                        onChange={(e) => setTime(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Question</Label>
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer A</Label>
                      <Input
                        value={answerA}
                        onChange={(e) => setAnswerA(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer B</Label>
                      <Input
                        value={answerB}
                        onChange={(e) => setAnswerB(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer C</Label>
                      <Input
                        value={answerC}
                        onChange={(e) => setAnswerC(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer D</Label>
                      <Input
                        value={answerD}
                        onChange={(e) => setAnswerD(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Correct Answer</Label>
                      <Select
                        value={correctAnswer}
                        onValueChange={setCorrectAnswer}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">A</SelectItem>
                          <SelectItem value="b">B</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                          <SelectItem value="d">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      onClick={handleAddQuestion}
                      disabled={addingQuestion}
                    >
                      {addingQuestion ? "Adding..." : "Add Question"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[32rem] w-full rounded-md border">
              <div className="p-4 grid gap-4">
                {questions.map((question, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Question {index + 1}
                          </CardTitle>
                          <CardDescription>
                            Points: {question.point} | Time: {question.time}s
                          </CardDescription>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Question
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <Button
                                onClick={() =>
                                  handleDeleteQuestion(question.id)
                                }
                              >
                                {deletingQuestionId === question.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-4">{question.question}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">A:</span>
                            <span>{question.answers.a}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">B:</span>
                            <span>{question.answers.b}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">C:</span>
                            <span>{question.answers.c}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">D:</span>
                            <span>{question.answers.d}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        Correct Answer: {question.correct.toUpperCase()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className={"gap-2"}>
                  <Trash className="h-4 w-4" />
                  Delete Room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Room</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this room? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button onClick={handleDeleteRoom} disabled={deletingRoom}>
                    {deletingRoom ? "Deleting..." : "Delete Room"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              className={"gap-2 text-right"}
              onClick={() => window.open("/leaderboard/" + roomCode, "_blank")}
            >
              <ListOrdered className="h-4 w-4" />
              Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
export default ManageRoom;
