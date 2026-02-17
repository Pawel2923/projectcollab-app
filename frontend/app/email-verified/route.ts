import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { addAlert } from "@/services/alert/alert-service";
import { mapMessage } from "@/services/message-mapper/message-mapper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const isOk = searchParams.get("verified") === "true";
    const { title, description } = mapMessage(
      isOk ? "EMAIL_VERIFIED" : "EMAIL_NOT_VERIFIED",
    );

    const response = NextResponse.redirect(new URL("/signin", req.url));

    await addAlert(response, {
      title,
      description,
      type: isOk ? "default" : "destructive",
      duration: 5000,
      hasCloseButton: true,
      icon: isOk ? "mail-check" : "mail-x",
    });

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ code: "EMAIL_NOT_VERIFIED" }, { status: 500 });
  }
}
