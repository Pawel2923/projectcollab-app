"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";

export function SearchBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (
      window.history.length > 1 &&
      document.referrer.includes(window.location.origin)
    ) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className="mb-4 pl-0 hover:bg-transparent hover:text-muted-foreground"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Wróć
    </Button>
  );
}
