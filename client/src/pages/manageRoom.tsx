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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Trash, UserX } from "lucide-react";

interface RoomData {
  room: {
    name: string;
    code: string;
    owner: {
      name: string;
    };
    members: { name: string; email: string }[];
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
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [deletedQuestionId, setDeletedQuestionId] = useState<string | null>(
    null,
  );
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addedQuestion, setAddedQuestion] = useState(false);
  const [banningUserEmail, setBanningUserEmail] = useState<string | null>(null);
  const [bannedUserEmail, setBannedUserEmail] = useState<string | null>(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [deletedRoom, setDeletedRoom] = useState(false);

  useEffect(() => {
    const fetchRoomData = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");
      try {
        const response = await axios.post(
          "http://192.168.6.31:8080/room",
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
        setError(err.message);
        toast.error("Failed to fetch room data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          "http://192.168.6.31:8080/getQuestions",
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
        setError(err.message);
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
          "http://192.168.6.31:8080/loadUsers",
          { roomCode },
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      } catch (err) {
        toast.error("Failed to fetch users.");
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
        "http://192.168.6.31:8080/addQuestion",
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Question added successfully.");
      setAddedQuestion(true);
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
        "http://192.168.6.31:8080/deleteQuestion",
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
      setDeletedQuestionId(questionId);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error("Failed to delete question.");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleBanUser = async (email: string) => {
    setBanningUserEmail(email);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://192.168.6.31:8080/banUser",
        {
          email: email,
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
      setBannedUserEmail(email);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error("Failed to ban user.");
    } finally {
      setBanningUserEmail(null);
    }
  };

  const handleDeleteRoom = async () => {
    setDeletingRoom(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://192.168.6.31:8080/deleteRoom",
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
      setDeletedRoom(true);
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

  if (localStorage.getItem("userEmail") !== roomData?.room.owner.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="mb-4">
          <Label className="block text-lg font-semibold">Room Name</Label>
          <p className="text-xl">{roomData?.room.name}</p>
        </div>
        <div className="mb-4">
          <Label className="block text-lg font-semibold">Room Code</Label>
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
          <Label className="block text-lg font-semibold">Owner</Label>
          <p className="text-xl">
            {roomData?.room.owner.name.replace(/"/g, "")}
          </p>
        </div>
        <ScrollArea className="h-72 w-full rounded-md border mb-4">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">
              {roomData?.room.members.length} Members
            </h4>
            {roomData?.room.members.map((member) => (
              <div key={member.email}>
                <div className="flex justify-between items-center">
                  <div className="text-sm">{member.name.replace(/"/g, "")}</div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="py-2 px-4">
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
                        <Button onClick={() => handleBanUser(member.email)}>
                          {banningUserEmail === member.email ? (
                            <Spinner content="Banning..." />
                          ) : bannedUserEmail === member.email ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            "Ban"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <h2 className="text-2xl mb-4">Questions</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Add Question</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add a New Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Please fill out the form below to add a new question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="p-4">
                <Label className="block mb-2">Question</Label>
                <Input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Enter your question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Label className="block mb-2">Answer A</Label>
                <Input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Enter answer A"
                  value={answerA}
                  onChange={(e) => setAnswerA(e.target.value)}
                />
                <Label className="block mb-2">Answer B</Label>
                <Input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Enter answer B"
                  value={answerB}
                  onChange={(e) => setAnswerB(e.target.value)}
                />
                <Label className="block mb-2">Answer C</Label>
                <Input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Enter answer C"
                  value={answerC}
                  onChange={(e) => setAnswerC(e.target.value)}
                />
                <Label className="block mb-2">Answer D</Label>
                <Input
                  type="text"
                  className="w-full mb-4 p-2 border rounded"
                  placeholder="Enter answer D"
                  value={answerD}
                  onChange={(e) => setAnswerD(e.target.value)}
                />
                <Label className="block mb-2">Correct Answer</Label>
                <Select
                  value={correctAnswer}
                  onValueChange={(value) => setCorrectAnswer(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Answers</SelectLabel>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                      <SelectItem value="d">D</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={handleAddQuestion} disabled={addingQuestion}>
                  {addingQuestion ? (
                    <Spinner content="Adding..." />
                  ) : addedQuestion ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "Add Question"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ScrollArea className="h-96 w-full rounded-md border mt-4">
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">
                {questions.length} Questions
              </h4>
              {questions.map((question, index) => (
                <div key={index} className="mb-4 relative">
                  <p className="font-bold">
                    {index + 1} - {question.question}
                  </p>
                  <ul className="list-disc pl-5">
                    <li>A: {question.answers.a}</li>
                    <li>B: {question.answers.b}</li>
                    <li>C: {question.answers.c}</li>
                    <li>D: {question.answers.d}</li>
                  </ul>
                  <p className="italic">Correct Answer: {question.correct}</p>
                  <Separator className="my-2" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="absolute top-0 right-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          {deletingQuestionId === question.id ? (
                            <Spinner content="Deleting..." />
                          ) : deletedQuestionId === question.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Room</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Room</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this room? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button onClick={handleDeleteRoom} disabled={deletingRoom}>
                  {deletingRoom ? (
                    <Spinner content="Deleting..." />
                  ) : deletedRoom ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ManageRoom;
