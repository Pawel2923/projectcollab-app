"use client";

import React from "react";

import { FormField } from "@/components/ui/Form/FormField";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps = Omit<
  React.ComponentProps<typeof FormField>,
  "children"
> & {
  textareaProps?: React.ComponentProps<typeof Textarea>;
};

export function FormTextarea({
  name,
  label,
  serverInvalid,
  serverMessage,
  valueMissingMessage,
  textareaProps,
  tooltipContent,
}: FormTextareaProps) {
  return (
    <FormField
      name={name}
      label={label}
      serverInvalid={serverInvalid}
      serverMessage={serverMessage}
      valueMissingMessage={valueMissingMessage}
      tooltipContent={tooltipContent}
    >
      <Textarea name={name} id={name} {...textareaProps} />
    </FormField>
  );
}
