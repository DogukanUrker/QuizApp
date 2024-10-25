import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/constans.ts";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Check, Sparkles, Trophy, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

interface Member {
  id: string;
  name: string;
  trueAnswers: number;
  falseAnswers: number;
  points: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userID = localStorage.getItem("userID");
  const [roomName, setRoomName] = useState("");
  const [userScore, setUserScore] = useState<Member | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { roomCode } = useParams<{ roomCode: string }>();

  const fetchLeaderboard = async (shouldShowDialog = false) => {
    try {
      const response = await axios.post(`${apiURL}leaderboard`, { roomCode });
      setLeaderboard(response.data.leaderboard);
      setRoomName(response.data.roomName);

      const userIndex = response.data.leaderboard.findIndex(
        (member: Member) => member.id === userID,
      );
      if (userIndex !== -1) {
        setUserScore(response.data.leaderboard[userIndex]);
        setUserRank(userIndex + 1);
        if (shouldShowDialog) {
          setIsDialogOpen(true);
        }
      }
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err) && err.response
          ? err.response.data.error
          : "Error fetching leaderboard",
      );
    }
  };

  useEffect(() => {
    // Initial fetch with dialog
    fetchLeaderboard(true);

    // Set up interval for updates without dialog
    const interval = setInterval(() => fetchLeaderboard(false), 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={"flex items-center justify-center min-h-screen"}>
      <div className={"h-11/12 w-full md:w-6/12"}>
        <h1 className={"text-center text-xl mb-2 font-medium select-none"}>
          {roomName} - Leaderboard
        </h1>
        <ScrollArea className="md:h-96 h-11/12 w-full rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">
            {leaderboard?.length} Members
          </h4>
          {leaderboard.map((member, index) => (
            <div key={index} className="mb-2 w-full">
              <div
                className={`grid grid-cols-4 gap-4 items-center ${userID === member.id ? "dark:bg-neutral-800 hover:dark:bg-neutral-800/75 bg-neutral-200 hover:bg-neutral-200/75 duration-150 rounded py-2 pl-2 cursor-pointer" : ""}`}
                onClick={() => {
                  if (userID === member.id) {
                    setIsDialogOpen(true);
                  }
                }}
              >
                <div className="flex items-center">
                  <span className="mr-1">{index + 1}.</span>
                  <span>{member.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Check className="mr-1" />
                  <span>{member.trueAnswers}</span>
                </div>
                <div className="flex items-center justify-center">
                  <X className="mr-1" />
                  <span>{member.falseAnswers}</span>
                </div>
                <div className="flex items-center justify-center font-bold">
                  <Sparkles className="mr-1" />
                  <span>{member.points}</span>
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          ))}
        </ScrollArea>
      </div>
      {userScore && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger />
          <AlertDialogContent>
            <AlertDialogTitle>Your Score</AlertDialogTitle>
            <AlertDialogDescription>
              <div className={"flex justify-between"}>
                <div className="flex items-center">
                  <Trophy className={"mr-1"} />
                  <span className="mr-1">Rank</span>
                  <b>{userRank}</b>
                </div>
                <div className="flex items-center">
                  <Sparkles className="mr-1" />
                  <span>
                    Points <b>{userScore.points}</b>
                  </span>
                </div>
              </div>
              <div className={"flex justify-between my-2"}>
                <div className="flex items-center">
                  <Check className="mr-1" />
                  <span>
                    True Answers <b>{userScore.trueAnswers}</b>
                  </span>
                </div>
                <div className="flex items-center">
                  <X className="mr-1" />
                  <span>
                    False Answers <b>{userScore.falseAnswers}</b>
                  </span>
                </div>
              </div>
              <AlertDialogAction
                className={"w-full mt-2"}
                onClick={() => setIsDialogOpen(false)}
              >
                See Others
              </AlertDialogAction>
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Leaderboard;
