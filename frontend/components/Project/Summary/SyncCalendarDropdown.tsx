import { CalendarSync, CalendarX2, Loader2Icon } from "lucide-react";
import React, { useState } from "react";

import syncCalendar from "@/actions/calendar/syncCalendar";
import { GoogleLogoIcon } from "@/assets/icons/GoogleLogoIcon";
import { MicrosoftLogoIcon } from "@/assets/icons/MicrosoftLogoIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAlert } from "@/hooks/useAlert";
import { formatDateTime } from "@/utils/date-utils";

interface SyncCalendarDropdownProps {
  issueIds: number[];
  oAuthProviders?: string[];
  lastSyncedAt?: string;
}

export function SyncCalendarDropdown({
  issueIds,
  oAuthProviders,
  lastSyncedAt: initialLastSyncedAt,
}: SyncCalendarDropdownProps) {
  const { notify } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | undefined>(
    initialLastSyncedAt,
  );

  const optionClickHandler = async (provider: string) => {
    setIsLoading(true);
    const response = await syncCalendar({ provider, issueIds });
    setIsLoading(false);

    if (!response.ok) {
      console.error(response);
      notify({
        title: "Błąd synchronizacji",
        description: `Synchronizacja z ${mapProviderName(provider)} nie powiodła się`,
        type: "destructive",
        icon: <CalendarX2 />,
      });

      return;
    }

    if (!("content" in response) || !response.content) {
      console.error("Missing content in response");
      notify({
        title: "Błąd synchronizacji",
        description: `Błąd odpowiedzi serwera`,
        type: "destructive",
        icon: <CalendarX2 />,
      });
      return;
    }

    setLastSynced(response.content.lastSyncedAt);

    notify({
      title: "Synchronizacja zakończona",
      description: `Synchronizacja z ${mapProviderName(provider)} została zakończona`,
      type: "default",
      icon: <CalendarSync />,
    });
  };

  const mapProvider = (provider: string): React.ReactNode => {
    switch (provider) {
      case "google":
        return (
          <>
            <DropdownMenuItem
              onClick={() => optionClickHandler("google")}
              disabled={isLoading || !oAuthProviders?.includes("google")}
            >
              <GoogleLogoIcon size={21} />
              {mapProviderName("google")}
            </DropdownMenuItem>
          </>
        );
      case "microsoft-entra-id":
        return (
          <>
            <DropdownMenuItem
              onClick={() => optionClickHandler("microsoft-entra-id")}
              disabled={
                isLoading || !oAuthProviders?.includes("microsoft-entra-id")
              }
            >
              <MicrosoftLogoIcon size={21} />
              {mapProviderName("microsoft-entra-id")}
            </DropdownMenuItem>
          </>
        );
      default:
        return "Nieznany kalendarz";
    }
  };

  const hasProviders = oAuthProviders?.length && oAuthProviders?.length > 0;

  return (
    <div className="flex items-center gap-4">
      {lastSynced && (
        <span className="text-xs text-muted-foreground">
          Ostatnia synchronizacja:{" "}
          <span suppressHydrationWarning>
            {lastSynced ? formatDateTime(new Date(lastSynced)) : "Nigdy"}
          </span>
        </span>
      )}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button disabled={isLoading || !hasProviders}>
                {isLoading ? (
                  <>
                    <Loader2Icon className="animate-spin" /> Synchronizowanie...
                  </>
                ) : (
                  <>
                    <CalendarSync /> Synchronizuj kalendarz
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          {!hasProviders && (
            <TooltipContent>
              Musisz połączyć konto z Google lub Microsoft, aby synchronizować
              kalendarz.
            </TooltipContent>
          )}
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuLabel>Wybierz kalendarz</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mapProvider("google")}
          {mapProvider("microsoft-entra-id")}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function mapProviderName(provider: string): string {
  switch (provider) {
    case "google":
      return "Kalendarz Google";
    case "microsoft-entra-id":
      return "Microsoft Outlook";
    default:
      return "Nieznany kalendarz";
  }
}
