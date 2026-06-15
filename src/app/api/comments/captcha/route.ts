import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";
import { config } from "@/lib/config";

export async function GET() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;

  const captcha = generateCaptcha(num1, num2, config.nextAuthSecret);

  return NextResponse.json(captcha);
}
