import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { apiURL } from "@/constans";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Clock, Star, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuestionData {
  question: {
    answers: {
      a: string;
      b: string;
      c: string;
      d: string;
    };
    correct: string;
    id: string;
    point: number;
    question: string;
    time: number;
  };
}

interface SubmitAnswerResponse {
  error?: boolean;
  message?: string;
  status?: string;
}

const FormSchema = z.object({
  answer: z.enum(["a", "b", "c", "d"], {
    required_error: "Please select an answer",
  }),
});

const Game = () => {
  const navigate = useNavigate();
  const { roomCode, questionNumber } = useParams<{
    roomCode: string;
    questionNumber: string;
  }>();

  const userID = localStorage.getItem("userID");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const response = await axios.post<QuestionData>(
          `${apiURL}/getQuestion`,
          {
            roomCode,
            questionNumber,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        setQuestionData(response.data);
        setStartTime(Date.now());
        setTimeLeft(response.data.question.time);
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response
            ? err.response.data.error
            : "Failed to fetch question data";
        setError(errorMessage);
        toast.error("Failed to fetch question data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [roomCode, questionNumber]);

  // Timer effect
  useEffect(() => {
    if (!questionData || !startTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = questionData.question.time - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        toast.error("Time's up!");
        axios.post(`${apiURL}/timeoutAnswer`, {
          roomCode,
          userID,
          questionNumber,
        });
        navigate(`/game/${roomCode}/${parseInt(questionNumber!) + 1}`);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [questionData, startTime, roomCode, questionNumber, navigate]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const elapsedTime = startTime ? (Date.now() - startTime) / 1000 : 0;

    try {
      const response = await axios.post<SubmitAnswerResponse>(
        `${apiURL}/submitAnswer`,
        {
          roomCode,
          userID,
          questionNumber,
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
          navigate(`/leaderboard/${roomCode}`);
        } else {
          navigate(`/game/${roomCode}/${parseInt(questionNumber!) + 1}`);
        }
      }
    } catch (err) {
      toast.error("You already answered this question");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate(`/game/${roomCode}/${parseInt(questionNumber!) + 1}`);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      form.reset();
      setSelectedAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-full" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    if (error === "list index out of range") {
      navigate(`/leaderboard/${roomCode}`);
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-red-500">
                <X className="mr-2 h-6 w-6" />
                <span className="text-lg font-medium">No more questions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <X className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const timeProgress = (timeLeft / (questionData?.question.time || 1)) * 100;

  document.title = `Question ${questionNumber} - ${roomCode}`;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>Question {questionNumber}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">
                {questionData?.question.point} points
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Time Left: {timeLeft}s
              </span>
            </div>
            <Progress value={timeProgress} className="h-2" />
            <span className="text-sm text-muted-foreground">
              Faster answers earn more points!
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-lg font-medium">
              {questionData?.question.question}
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={(value) => {
                setSelectedAnswer(value);
                form.setValue("answer", value as "a" | "b" | "c" | "d");
              }}
              className="space-y-4"
            >
              {Object.entries(questionData?.question.answers || {}).map(
                ([key, value]) => (
                  <Label
                    key={key}
                    htmlFor={key}
                    className="block cursor-pointer"
                  >
                    <div
                      className={`flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors ${
                        selectedAnswer === key ? "bg-accent" : ""
                      }`}
                    >
                      <RadioGroupItem value={key} id={key} />
                      <span className="flex-grow">{value}</span>
                    </div>
                  </Label>
                ),
              )}
            </RadioGroup>
            <Button type="submit" className="w-full">
              Submit Answer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Game;
