import { ArrowLeft, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const goBack = () => {
    window.history.back();
  };

  const goHome = () => {
    window.location.href = "/";
  };

  document.title = "404 - Page Not Found";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AlertDialog open={true}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="text-center">
              <div className="text-8xl font-bold mb-4">404</div>
              <AlertDialogTitle className="text-2xl">
                Page Not Found
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="text-center">
              The page you're looking for doesn't exist or has been moved.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="sm:space-x-2 flex-col sm:flex-row space-y-2 sm:space-y-0">
            <Button
              variant="outline"
              onClick={goBack}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            <Button
              onClick={goHome}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home Page
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotFound;
