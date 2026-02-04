"use client";

import type { RadioGroupProps } from "@radix-ui/react-radio-group";
import React from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { FormField } from "./FormField";

type FormRadioGroupOption = {
  value: string;
  label: string;
  id: string;
};

type FormRadioGroupProps = Omit<
  React.ComponentProps<typeof FormField>,
  "children"
> & {
  radioGroupProps?: RadioGroupProps;
  options: FormRadioGroupOption[];
};

export function FormRadioGroup({
  name,
  label,
  serverInvalid,
  serverMessage,
  valueMissingMessage,
  radioGroupProps,
  options,
}: FormRadioGroupProps) {
  return (
    <FormField
      name={name}
      label={label}
      serverInvalid={serverInvalid}
      serverMessage={serverMessage}
      valueMissingMessage={valueMissingMessage}
      asChild
    >
      <Label withoutControls>{label}</Label>
      <RadioGroup name={name} {...radioGroupProps}>
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.id} />
            <Label htmlFor={option.id} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
}
