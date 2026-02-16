import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React from "react";

import { isOk } from "@/error/result";
import { useMercureObserver } from "@/hooks/useMercureObserver";
import { clientApiGet } from "@/lib/utils/clientApiClient";
import type { Collection } from "@/types/api/collection";
import type { IssueComment } from "@/types/api/issue-metadata";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { EmptyRelationCopy } from "../EmptyRelationCopy";
import { AddIssueCommentForm } from "./AddCommentForm";
import { IssueCommentContainer } from "./IssueCommentContainer";

interface IssueCommentsProps {
  issueId: string;
  initialComments?: Collection<IssueComment>;
}

export function Comments({ issueId, initialComments }: IssueCommentsProps) {
  const queryClient = useQueryClient();
  const {
    data: comments,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["comments", issueId],
    queryFn: async () => {
      const result = await clientApiGet<Collection<IssueComment>>(
        `/comments?issueId=${issueId}`,
      );
      return result && isOk(result) ? result.value : null;
    },
    staleTime: 0,
    refetchOnMount: true,
    initialData: initialComments,
  });

  useMercureObserver({
    topics: [`/comments?issueId=${issueId}`],
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", issueId] });
    },
  });

  let cardContent = (
    <div className="col-span-full text-center text-disabled p-4 flex items-center justify-center gap-2">
      <Loader2 className="animate-spin" />
      Ładowanie komentarzy...
    </div>
  );

  if (!isLoading && !isFetching && comments) {
    cardContent =
      comments.member.length > 0 ? (
        <ul className="space-y-4">
          {comments.member.map((comment) => (
            <IssueCommentContainer
              key={comment["@id"]}
              comment={comment}
              onCommentUpdated={() =>
                queryClient.invalidateQueries({
                  queryKey: ["comments", issueId],
                })
              }
            />
          ))}
        </ul>
      ) : (
        <EmptyRelationCopy message="Brak komentarzy" />
      );
  }

  if (error) {
    cardContent = (
      <div className="col-span-full text-center text-destructive p-4">
        Błąd podczas ładowania komentarzy: {(error as Error).message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>
          <h3>Komentarze</h3>
        </CardTitle>
        <CardDescription>
          <AddIssueCommentForm
            issueId={issueId}
            onCommentAdded={() =>
              queryClient.invalidateQueries({ queryKey: ["comments", issueId] })
            }
          />
        </CardDescription>
      </CardHeader>
      <CardContent>{cardContent}</CardContent>
    </Card>
  );
}
