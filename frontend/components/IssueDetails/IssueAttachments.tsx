import { FileIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useRef, useTransition } from "react";

import { deleteAttachment } from "@/actions/deleteAttachment";
import { uploadAttachment } from "@/actions/uploadAttachment";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { extractIdFromIri } from "@/lib/utils/iri";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { EmptyRelationCopy } from "./EmptyRelationCopy";
import type { IssueDetails } from "./types";

interface IssueAttachmentsProps {
  issue: IssueDetails;
}

export function IssueAttachments({ issue }: IssueAttachmentsProps) {
  const [isUploading, startUpload] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showSuccess } = useErrorHandler();
  const params = useParams();
  const organizationId = params.organizationId as string;
  const projectId = params.projectId as string;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError({
        code: "FILE_TOO_LARGE",
        status: 400,
        message: "File size exceeds 10MB limit",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("issue", issue["@id"]);
    formData.append("issueId", String(issue.id));
    formData.append("organizationId", organizationId);
    formData.append("projectId", projectId);

    startUpload(async () => {
      const result = await uploadAttachment(formData);
      if (!result.ok) {
        showError(result);
      } else {
        showSuccess("Plik został dodany");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  const handleDelete = (attachmentId: string) => {
    startDelete(async () => {
      const result = await deleteAttachment(
        attachmentId,
        String(issue.id),
        organizationId,
        projectId,
      );
      if (!result.ok) {
        showError(result);
      } else {
        showSuccess("Załącznik został usunięty");
      }
    });
  };

  const attachments = issue.attachments || [];

  return (
    <Accordion type="multiple" className="">
      <AccordionItem value="attachments" className="border-b-0 pb-0">
        <AccordionTrigger className="pt-0 pb-2">
          <div className="flex items-center gap-2">
            <span>Załączone pliki</span>
            <span className="text-xs text-muted-foreground">
              ({attachments.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="space-y-4">
            {attachments.length > 0 ? (
              <ul className="space-y-2">
                {attachments.map((attachment) => {
                  const id = extractIdFromIri(attachment["@id"]);
                  const fileName = attachment.path.split("/").pop();
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                  const fileUrl = `${apiUrl}${attachment.path}`;

                  return (
                    <li
                      key={attachment["@id"]}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                          <FileIcon className="size-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate font-medium hover:underline"
                              >
                                {fileName}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>{fileName}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  attachment.uploadedAt,
                                ).toLocaleDateString()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Dodano{" "}
                              {new Date(
                                attachment.uploadedAt,
                              ).toLocaleDateString()}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                disabled={isDeleting}
                                aria-label="Usuń załącznik"
                              >
                                <Trash2Icon
                                  className="size-4"
                                  aria-hidden={true}
                                />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Usuń załącznik</TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Czy na pewno chcesz usunąć ten załącznik?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tej operacji nie można cofnąć.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => id && handleDelete(id)}
                              >
                                Usuń
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyRelationCopy message="Brak załączników" />
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <UploadIcon className="size-4" />
                )}
                {isUploading ? "Wysyłanie..." : "Dodaj załącznik"}
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
