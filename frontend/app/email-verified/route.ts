import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { addAlertAndGetResponse } from "@/lib/services/alertService";
import { mapMessage } from "@/lib/utils/messageMapper/messageMapper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const isOk = searchParams.get("verified") === "true";
    const { title, description } = mapMessage(
      isOk ? "EMAIL_VERIFIED" : "EMAIL_NOT_VERIFIED",
    );

    return addAlertAndGetResponse(
      NextResponse.redirect(new URL("/signin", req.url)),
      {
        title,
        description,
        type: isOk ? "default" : "destructive",
        duration: 5000,
        hasCloseButton: true,
        icon: isOk ? "mail-check" : "mail-x",
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ code: "EMAIL_NOT_VERIFIED" }, { status: 500 });
  }
}
