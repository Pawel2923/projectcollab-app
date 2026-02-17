import { redirect } from "next/navigation";
import React from "react";

import { getCurrentUser } from "@/services/userService";
import { UserProvider } from "@/store/UserContext";
import { match } from "@/utils/result";

export default async function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userResult = await getCurrentUser();

  const currentUser = match(userResult, {
    ok: (user) => user,
    err: (error) => {
      // If unauthorized, trigger the session refresh loop
      if (error.code === "UNAUTHORIZED" || error.status === 401) {
        redirect("/api/auth/session-expired?redirect=/organizations");
      }
      return null;
    },
  });

  return <UserProvider initial={currentUser}>{children}</UserProvider>;
}
