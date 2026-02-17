import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { addAlertAndGetResponse } from "@/services/alert/alert-service";
import { mapMessage } from "@/services/message-mapper/message-mapper";

type VerifyEmailParams = {
  signature: string;
  expires: string;
  id: string;
  token: string;
};

export async function GET(req: NextRequest) {
  const baseUrl =
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    new URL(req.url).origin;

  const returnUrl = new URL("/verify-email", baseUrl);

  try {
    const { searchParams } = new URL(req.url);
    const params: VerifyEmailParams = {
      signature: searchParams.get("signature") ?? "",
      expires: searchParams.get("expires") ?? "",
      id: searchParams.get("id") ?? "",
      token: searchParams.get("token") ?? "",
    };

    const queryString = new URLSearchParams(params).toString();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/verify-email?${queryString}`,
    );
    const data = await res.json();

    const { title, description } = mapMessage(
      data.code || "INTERNAL_SERVER_ERROR",
    );

    return addAlertAndGetResponse(
      NextResponse.redirect(
        data.isVerified ? new URL("/", baseUrl) : returnUrl,
      ),
      {
        title,
        description,
        icon: data.isVerified ? "mail-check" : "mail-x",
        type: data.isVerified ? "default" : "destructive",
        hasCloseButton: true,
        duration: 5000,
      },
    );
  } catch (e) {
    console.error(e);

    const { title, description } = mapMessage("INTERNAL_SERVER_ERROR");

    return addAlertAndGetResponse(NextResponse.redirect(returnUrl), {
      title,
      description,
      icon: "mail-x",
      type: "destructive",
      hasCloseButton: true,
      duration: 5000,
    });
  }
}
