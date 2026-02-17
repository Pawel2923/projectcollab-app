"use client";

import * as Form from "@radix-ui/react-form";
import { CheckIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

import createProject from "@/actions/createProject";
import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerValidation } from "@/hooks/useServerValidation";
import { classNamesMerger } from "@/utils/class-names-merger";

const FORM_FIELDS = ["name"] as const;

interface CreateProjectFormProps extends React.ComponentPropsWithoutRef<"div"> {
  organizationId: string;
}

export function CreateProjectForm({
  organizationId,
  className,
  ...props
}: CreateProjectFormProps) {
  const [state, formAction, pending] = useActionState(createProject, null);
  const { serverErrors, clearServerErrors } = useServerValidation(
    FORM_FIELDS,
    state,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div
      className={classNamesMerger("flex flex-col gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Utwórz nowy projekt</CardTitle>
          <CardDescription>
            Utwórz nowy projekt, aby zorganizować swoją pracę
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.ok ? (
            <div className="text-center py-4">
              <CheckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Projekt został pomyślnie utworzony!
              </p>
            </div>
          ) : (
            <Form.Root
              action={formAction}
              onSubmit={clearServerErrors}
              onClearServerErrors={clearServerErrors}
            >
              <div className="grid gap-6">
                {/* Hidden field for organization ID */}
                <input
                  type="hidden"
                  name="organizationId"
                  value={organizationId}
                />

                <Form.Field
                  name="name"
                  className="grid gap-2"
                  serverInvalid={serverErrors.name.isInvalid}
                >
                  <Form.Label asChild>
                    <div className="flex items-center">
                      <Label htmlFor="name">Nazwa projektu</Label>
                    </div>
                  </Form.Label>
                  <Form.Control asChild>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Wprowadź nazwę projektu"
                      autoComplete="off"
                      required
                    />
                  </Form.Control>
                  <Form.Message match="valueMissing" asChild>
                    <TypographyInvalid>
                      Nazwa projektu jest wymagana
                    </TypographyInvalid>
                  </Form.Message>
                  {serverErrors.name.isInvalid && (
                    <Form.Message asChild>
                      <TypographyInvalid>
                        {serverErrors.name.message}
                      </TypographyInvalid>
                    </Form.Message>
                  )}
                </Form.Field>

                {serverErrors.form?.isInvalid && (
                  <TypographyInvalid>
                    {serverErrors.form.message}
                  </TypographyInvalid>
                )}

                <Form.Submit asChild>
                  <Button type="submit" className="w-full" disabled={pending}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Utwórz projekt
                    {pending && <Loader2Icon className="animate-spin ml-2" />}
                  </Button>
                </Form.Submit>
              </div>
            </Form.Root>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
