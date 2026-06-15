import crypto from "crypto";

export function generateCaptcha(num1: number, num2: number, secret: string) {
  const answer = num1 + num2;
  const token = crypto
    .createHmac("sha256", secret)
    .update(answer.toString())
    .digest("hex");

  return {
    question: `Berapakah ${num1} + ${num2}?`,
    token,
  };
}

export function verifyCaptcha(answer: string, token: string, secret: string): boolean {
  if (!answer || !token || !secret) return false;
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(answer.trim())
    .digest("hex");

  return expectedHash === token;
}
