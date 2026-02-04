"use client";

import React from "react";

import { FormField } from "@/components/ui/Form/FormField";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormSelectProps = Omit<
  React.ComponentProps<typeof FormField>,
  "children"
> & {
  selectProps?: React.ComponentProps<typeof Select>;
  placeholder?: string;
  children: React.ReactNode;
};

export function FormSelect({
  name,
  label,
  serverInvalid,
  serverMessage,
  valueMissingMessage,
  selectProps,
  placeholder,
  children,
  tooltipContent,
}: FormSelectProps) {
  return (
    <FormField
      name={name}
      label={label}
      serverInvalid={serverInvalid}
      serverMessage={serverMessage}
      valueMissingMessage={valueMissingMessage}
      tooltipContent={tooltipContent}
    >
      <Select name={name} {...selectProps}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormField>
  );
}
