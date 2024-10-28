import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/constans.ts";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Sparkles, Trophy, UserRound, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  trueAnswers: number;
  falseAnswers: number;
  points: number;
}

const LeaderboardManage = () => {
  const [leaderboard, setLeaderboard] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | boolean>(false);
  const { roomCode } = useParams<{ roomCode: string }>();
  const [roomName, setRoomName] = useState("");
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.post(`${apiURL}leaderboard`, { roomCode });
      setLeaderboard(response.data.leaderboard);
      setOwner(response.data.owner);
      setRoomName(response.data.roomName);
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err) && err.response
          ? err.response.data.error
          : "Error fetching leaderboard",
      );
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const handleBanUser = async (id: string) => {
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
    } catch (err) {
      console.error("Failed to ban user:", err); // Log the error
      toast.error("Failed to ban user.");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle className="flex items-center gap-2">
            <X className="h-5 w-5" />
            Error
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (localStorage.getItem("userEmail") !== owner) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle className="flex items-center gap-2">
            <X className="h-5 w-5" />
            Unauthorized Access
          </AlertTitle>
          <AlertDescription>
            You don't have permission to manage this leaderboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  document.title = "Manage/Leaderboard - " + roomName;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full md:w-10/12">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col items-center justify-center gap-2 text-2xl font-semibold">
            Manage Leaderboard
            <span className={"text-sm"}>
              {roomName} - #{roomCode}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[40rem] w-full rounded-md border">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {leaderboard?.length} Members
                </h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Wrong</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead>Ban User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index === 0 ? (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          ) : index === 1 ? (
                            <Trophy className="h-4 w-4 text-gray-500" />
                          ) : index === 2 ? (
                            <Trophy className="h-4 w-4 text-orange-500" />
                          ) : (
                            <span>{index + 1}.</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4" />
                          <span>{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{member.trueAnswers}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <X className="h-4 w-4 text-red-500" />
                          <span>{member.falseAnswers}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span>{member.points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/90 hover:text-destructive-foreground mx-auto"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ban Player</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to ban {member.name} from
                                the leaderboard? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90 dark:text-white"
                                onClick={handleBanUser.bind(null, member.id)}
                              >
                                Ban
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </div>
    </div>
  );
};

export default LeaderboardManage;
