import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { classNamesMerger } from "@/utils/class-names-merger";

type PasswordToggleProps = {
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoComplete?: "current-password" | "new-password";
} & React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordToggle({
  name,
  placeholder = "",
  required = true,
  className = "",
  ...rest
}: PasswordToggleProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <div className="relative">
      <Input
        name={name}
        id={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        className={classNamesMerger("pr-10", className)}
        {...rest}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleVisibility}
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        aria-label={isVisible ? "Ukryj hasło" : "Pokaż hasło"}
      >
        {isVisible ? (
          <EyeOpenIcon className="h-4 w-4" />
        ) : (
          <EyeClosedIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
