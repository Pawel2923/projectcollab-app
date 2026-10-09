import * as Form from "@radix-ui/react-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordToggle } from "@/components/PasswordToggle";

import { FormField } from "./FormField";
import { FormInput } from "./FormInput";

describe("FormField and FormInput", () => {
  it("renders server error message when serverInvalid is true", () => {
    render(
      <Form.Root>
        <FormInput
          name="email"
          label="Email"
          serverInvalid={true}
          serverMessage="Email jest nieprawidłowy"
        />
      </Form.Root>,
    );

    expect(screen.getByText("Email jest nieprawidłowy")).toBeInTheDocument();
  });

  it("renders password toggle with server error message", () => {
    render(
      <Form.Root>
        <FormField
          name="password"
          label="Hasło"
          serverInvalid={true}
          serverMessage="Hasło jest za krótkie"
          asChild
        >
          <PasswordToggle name="password" />
        </FormField>
      </Form.Root>,
    );

    expect(screen.getByText("Hasło jest za krótkie")).toBeInTheDocument();
  });
});
