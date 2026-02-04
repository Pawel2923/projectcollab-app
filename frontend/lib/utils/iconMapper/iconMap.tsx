import { Check, MailCheck, MailX, XCircle } from "lucide-react";
import React from "react";

export const iconMap: Record<string, React.ReactNode> = {
  "mail-check": <MailCheck />,
  "mail-x": <MailX />,
  "x-circle": <XCircle />,
  check: <Check />,
};
