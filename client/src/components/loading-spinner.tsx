import React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  content?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  className = "mr-2 h-5 w-5 animate-spin",
  content = "Loading",
}) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", "mr-2", className)}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      {content}
    </>
  );
};

export default Spinner;
