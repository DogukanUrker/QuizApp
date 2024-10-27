import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { apiURL } from "@/constans.ts";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionData {
  answers: string[];
  correct: string;
  id: string;
  point: number;
  question: string;
  time: number;
}

const FormSchema = z.object({
  answer: z.enum(["a", "b", "c", "d"]),
});

const Game = () => {
  const { roomCode, questionNumber } = useParams<{
    roomCode: string;
    questionNumber: string;
  }>();
  const userID = localStorage.getItem("userID");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const response = await axios.post(
          apiURL + "/getQuestion",
          {
            roomCode: roomCode,
            questionNumber: questionNumber,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        setQuestionData(response.data);
        setStartTime(Date.now()); // Start the timer when question data is loaded
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          toast.error("Failed to fetch room data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [roomCode]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!data.answer) {
      toast.error("Please select an answer.");
      return;
    }
    const elapsedTime = startTime ? (Date.now() - startTime) / 1000 : 0; // Calculate elapsed time in seconds
    try {
      const response = await axios.post(
        apiURL + "/submitAnswer",
        {
          roomCode: roomCode,
          userID: userID,
          questionNumber: questionNumber,
          answer: data.answer,
          point: questionData?.question.point,
          timeTaken: elapsedTime,
          time: questionData?.question.time,
          correct: questionData?.question.correct,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.error) {
        toast.error(response.data.message);
      } else {
        toast.success("Answer submitted successfully");
        if (response.data.status === "end") {
          window.location.href = `/leaderboard/${roomCode}`;
        } else {
          window.location.href = `/game/${roomCode}/${parseInt(questionNumber) + 1}`;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error("You already answered this question.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.href = `/game/${roomCode}/${parseInt(questionNumber) + 1}`;
      }
    }
  };

  if (loading) {
    return (
      <div
        className={"flex items-center justify-center min-h-screen select-none"}
      >
        <Card className="p-6 rounded-lg max-w-md w-full">
          <Skeleton className="h-[125px] w-full rounded-xl mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-[40px] w-full rounded mt-4" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={"flex items-center justify-center min-h-screen"}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen select-none">
      <Card className="p-6 rounded-lg max-w-md w-full">
        <Label className="text-md font-semibold">
          {questionNumber}. Question
        </Label>
        <h1 className="mb-4 text-xl font-bold">
          {questionData?.question.question}
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RadioGroup
            onValueChange={(value) => form.setValue("answer", value)}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="a" id="a" />
              <Label htmlFor="a" className="text-base cursor-pointer">
                {questionData?.question.answers.a}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="b" id="b" />
              <Label htmlFor="b" className="text-base cursor-pointer">
                {questionData?.question.answers.b}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="c" id="c" />
              <Label htmlFor="c" className="text-base cursor-pointer">
                {questionData?.question.answers.c}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="d" id="d" />
              <Label htmlFor="d" className="text-base cursor-pointer">
                {questionData?.question.answers.d}
              </Label>
            </div>
          </RadioGroup>
          <Button type="submit" className="w-full py-2">
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Game;
