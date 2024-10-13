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
import { Check, Trash } from "lucide-react";

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
      setAddedQuestion(true); // Set the added question state
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
    setDeletingQuestionId(questionId); // Set the deleting question ID
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

  if (localStorage.getItem("userEmail") !== roomData?.room.owner.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unauthorized</p>
      </div>
    );
  }

  return (
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
        <ScrollArea className="h-72 w-56 rounded-md border">
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
          <ScrollArea className="h-96 w-56 rounded-md border">
            <div className="p-4">
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
                  <Button
                    variant="ghost"
                    className="absolute top-0 right-0"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    {deletingQuestionId === question.id ? (
                      <Spinner content="Deleting..." />
                    ) : deletedQuestionId === question.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ManageRoom;
