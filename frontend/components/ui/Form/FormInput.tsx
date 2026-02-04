"use client";

import React from "react";

import { FormField } from "@/components/ui/Form/FormField";
import { Input } from "@/components/ui/input";

type FormInputProps = Omit<
  React.ComponentProps<typeof FormField>,
  "children"
> & {
  type?: React.ComponentProps<"input">["type"];
  inputProps?: Omit<React.ComponentProps<"input">, "name" | "id" | "type">;
};

export function FormInput({
  name,
  label,
  type = "text",
  serverInvalid,
  serverMessage,
  valueMissingMessage,
  inputProps,
  tooltipContent,
}: FormInputProps) {
  return (
    <FormField
      name={name}
      label={label}
      serverInvalid={serverInvalid}
      serverMessage={serverMessage}
      valueMissingMessage={valueMissingMessage}
      tooltipContent={tooltipContent}
    >
      <Input name={name} id={name} type={type} {...inputProps} />
    </FormField>
  );
}
