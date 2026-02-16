import { redirect } from "next/navigation";

import { isAuthenticated } from "@/services/auth/token-read-service";

export default async function Home() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/organizations");
  } else {
    redirect("/signin");
  }
}
