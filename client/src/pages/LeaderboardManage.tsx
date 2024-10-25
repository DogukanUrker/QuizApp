import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/constans.ts";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Check, Sparkles, Trash, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

const LeaderboardManage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [owner, setOwner] = useState(false);
  const { roomCode } = useParams<{
    roomCode: string;
  }>();
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.post(`${apiURL}leaderboard`, { roomCode });
      setLeaderboard(response.data.leaderboard);
      setOwner(response.data.owner);
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Error fetching leaderboard",
      );
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const removeUser = () => {
    // Implement remove user functionality
  };

  if (localStorage.getItem("userEmail") !== owner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Unauthorized</p>
      </div>
    );
  }

  return (
    <div className={"flex items-center justify-center min-h-screen"}>
      <div className={"h-11/12 w-full md:w-6/12"}>
        <h1 className={"text-center text-xl mb-2 font-medium select-none"}>
          Leaderboard
        </h1>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">
            {leaderboard?.length} Members
          </h4>
          {leaderboard.map((member, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <div className={"flex"}>
                  <Button variant={"ghost"} onClick={removeUser}>
                    <Trash />
                  </Button>
                  <UserRound className={"mr-1"} />
                  {member.name}
                </div>
                <div className="flex">
                  <Check className={"mr-1"} />
                  {member.trueAnswers}
                </div>
                <div className="flex">
                  <X className={"mr-1"} />
                  {member.falseAnswers}
                </div>
                <div className={"flex font-bold"}>
                  <Sparkles className={"mr-1"} />
                  {member.points}
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeaderboardManage;
