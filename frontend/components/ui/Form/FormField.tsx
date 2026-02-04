"use client";

import * as Form from "@radix-ui/react-form";
import React from "react";

import { TypographyInvalid } from "@/components/typography/TypographyInvalid";
import { Label } from "@/components/ui/label";

import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

type FormFieldProps = {
  name: string;
  label: string;
  serverInvalid: boolean;
  serverMessage?: string;
  valueMissingMessage?: string;
  tooltipContent?: React.ReactNode | string;
} & (
  | {
      asChild: true;
      children: React.ReactNode | React.ReactNode[];
    }
  | {
      asChild?: false;
      children: React.ReactElement<{ id?: string; type?: string }>;
    }
);

export function FormField({
  name,
  label,
  serverInvalid,
  serverMessage,
  children,
  valueMissingMessage,
  tooltipContent,
  asChild,
}: FormFieldProps) {
  const inputType = !asChild && children.props.type;

  return (
    <Form.Field
      name={name}
      className="grid gap-2"
      serverInvalid={serverInvalid}
    >
      {asChild ? (
        children
      ) : (
        <>
          <FormFieldLabel
            name={name}
            label={label}
            tooltipContent={tooltipContent}
          />
          <Form.Control asChild>{children}</Form.Control>
        </>
      )}
      {valueMissingMessage && (
        <Form.Message match="valueMissing" asChild>
          <TypographyInvalid>{valueMissingMessage}</TypographyInvalid>
        </Form.Message>
      )}
      {inputType === "email" && (
        <Form.Message match="typeMismatch" asChild>
          <TypographyInvalid>
            Proszę podać prawidłowy adres email
          </TypographyInvalid>
        </Form.Message>
      )}
      {serverInvalid && serverMessage && (
        <Form.Message asChild>
          <TypographyInvalid>{serverMessage}</TypographyInvalid>
        </Form.Message>
      )}
    </Form.Field>
  );
}

interface FormFieldLabelProps {
  name: string;
  label: string;
  id?: string;
  tooltipContent?: React.ReactNode | string;
}

export function FormFieldLabel({
  name,
  label,
  id,
  tooltipContent,
}: FormFieldLabelProps) {
  return tooltipContent ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Form.Label asChild>
          <div className="flex items-center">
            <Label htmlFor={id || name}>{label}</Label>
          </div>
        </Form.Label>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  ) : (
    <Form.Label asChild>
      <div className="flex items-center">
        <Label htmlFor={id || name}>{label}</Label>
      </div>
    </Form.Label>
  );
}
