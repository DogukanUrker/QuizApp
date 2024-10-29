import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/constans.ts";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Sparkles, Trophy, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [loading, setLoading] = useState<boolean>(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(true);
    const interval = setInterval(() => fetchLeaderboard(false), 6000);
    return () => clearInterval(interval);
  }, [roomCode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-gray-500">
              <span className="text-lg font-medium">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-red-500">
              <X className="mr-2 h-6 w-6" />
              <span className="text-lg font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  document.title = "Leaderboard - " + roomName;

  return (
    <div className="flex min-h-screen items-center justify-center p-0 md:p-4">
      <div className="w-full md:w-8/12">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl font-semibold">
            {roomName} - Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] w-full rounded-md border">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {leaderboard?.length} Members
                </h4>
              </div>
              <div className="w-full overflow-x-auto">
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%] min-w-[120px]">
                        Player
                      </TableHead>
                      <TableHead className="w-[25%] min-w-[80px] text-center">
                        Points
                      </TableHead>
                      <TableHead className="w-[20%] min-w-[80px] text-center">
                        Correct
                      </TableHead>
                      <TableHead className="w-[20%] min-w-[80px] text-center">
                        Wrong
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((member, index) => (
                      <TableRow
                        key={index}
                        className={`${
                          userID === member.id
                            ? "cursor-pointer bg-accent hover:bg-accent/90 dark:bg-accent/50 dark:hover:bg-accent/40"
                            : ""
                        } transition-colors duration-200`}
                        onClick={() => {
                          if (userID === member.id) {
                            setIsDialogOpen(true);
                          }
                        }}
                      >
                        <TableCell className="w-[35%] min-w-[120px]">
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
                            <span className="truncate">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[25%] min-w-[80px] text-center font-bold">
                          <div className="flex items-center justify-center gap-1">
                            <Sparkles className="h-4 w-4 text-yellow-500 hidden md:block" />
                            <span>{member.points}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[20%] min-w-[80px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Check className="h-4 w-4 text-green-500 hidden md:block" />
                            <span>{member.trueAnswers}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[20%] min-w-[80px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <X className="h-4 w-4 text-red-500 hidden md:block" />
                            <span>{member.falseAnswers}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </div>

      {userScore && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger />
          <AlertDialogContent>
            <AlertDialogTitle className="text-xl font-semibold">
              Your Score
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm">Rank</span>
                      </div>
                      <span className="text-lg font-bold">{userRank}</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm">Points</span>
                      </div>
                      <span className="text-lg font-bold">
                        {userScore.points}
                      </span>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Correct</span>
                      </div>
                      <span className="text-lg font-bold">
                        {userScore.trueAnswers}
                      </span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span className="text-sm">Wrong</span>
                      </div>
                      <span className="text-lg font-bold">
                        {userScore.falseAnswers}
                      </span>
                    </CardContent>
                  </Card>
                </div>
                <AlertDialogAction
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => setIsDialogOpen(false)}
                >
                  See Others
                </AlertDialogAction>
              </div>
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Leaderboard;
