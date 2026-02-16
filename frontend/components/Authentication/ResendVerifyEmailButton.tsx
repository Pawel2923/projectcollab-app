"use client";

import { Loader2Icon, MailCheck, MailX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAlert } from "@/hooks/useAlert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { mapMessage } from "@/services/message-mapper/message-mapper";
import { isApiPlatformError } from "@/types/api/api-platform-error";

export function ResendVerifyEmailButton() {
  const [isPending, setIsPending] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { notify } = useAlert();
  const { showError } = useErrorHandler();

  useEffect(() => {
    if (timer <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      return;
    }

    const callback = () => {
      setTimer((prev) => prev - 1);
    };

    intervalRef.current = setInterval(callback, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer]);

  const clickHandler = async () => {
    setTimer(30);
    setIsPending(true);
    try {
      const email = sessionStorage.getItem("auth_created_identity");
      if (!email || email === "null") {
        notify({
          title: "Nie udało się wysłać emaila weryfikacyjnego.",
          type: "destructive",
          icon: <MailX />,
          duration: 5000,
          hasCloseButton: true,
        });
        setTimer(0);
        return;
      }

      const res = await fetch("api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accepts: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (isApiPlatformError(data)) {
          showError(data);
        } else {
          const { title, description } = mapMessage(data.code);
          notify({
            title,
            description,
            type: "destructive",
            icon: <MailX />,
            duration: 5000,
            hasCloseButton: true,
          });
        }
        return;
      }

      const { title, description } = mapMessage(data.code);
      notify({
        title,
        description,
        type: "default",
        icon: <MailCheck />,
        duration: 5000,
        hasCloseButton: true,
      });
    } catch (error) {
      console.error("Network error:", error);
      showError(error);
      setTimer(0);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button onClick={clickHandler} disabled={isPending || timer > 0}>
        Wyślij ponownie email weryfikacyjny
        {isPending && <Loader2Icon />}
      </Button>
      {timer > 0 && (
        <div className="ms-2 flex items-center justify-center gap-2">
          Możesz spróbować ponownie za {timer} sekund{timer !== 1 ? "y" : "ę"}.
        </div>
      )}
    </>
  );
}
