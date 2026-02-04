"use client";

import React from "react";

import { Checkbox } from "@/components/ui/checkbox";

import { FormField, FormFieldLabel } from "./FormField";

type FormCheckboxProps = Omit<
  React.ComponentProps<typeof FormField>,
  "children"
> & {
  checkboxProps?: React.ComponentProps<typeof Checkbox>;
};

export function FormCheckbox({
  name,
  label,
  serverInvalid,
  serverMessage,
  valueMissingMessage,
  checkboxProps,
  tooltipContent,
}: FormCheckboxProps) {
  const id = checkboxProps?.id || name;

  return (
    <FormField
      name={name}
      label={label}
      serverInvalid={serverInvalid}
      serverMessage={serverMessage}
      valueMissingMessage={valueMissingMessage}
      tooltipContent={tooltipContent}
    >
      <div className="flex items-center gap-2">
        <Checkbox id={id} {...checkboxProps} />
        <FormFieldLabel name={name} label={label} id={id} />
      </div>
    </FormField>
  );
}
