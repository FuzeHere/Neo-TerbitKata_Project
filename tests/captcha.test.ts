import { describe, it, expect } from "vitest";
import { generateCaptcha, verifyCaptcha } from "@/lib/captcha";

describe("Captcha - generateCaptcha", () => {
  const secret = "test_secret_key";

  it("should generate a correct math question and HMAC token signature", () => {
    const num1 = 5;
    const num2 = 7;
    const captcha = generateCaptcha(num1, num2, secret);

    expect(captcha.question).toBe("Berapakah 5 + 7?");
    expect(captcha.token).toBeTypeOf("string");
    expect(captcha.token.length).toBe(64); // SHA-256 hex is 64 chars
  });
});

describe("Captcha - verifyCaptcha", () => {
  const secret = "test_secret_key";

  it("should verify correct answer successfully", () => {
    const num1 = 3;
    const num2 = 4;
    const captcha = generateCaptcha(num1, num2, secret);

    const isValid = verifyCaptcha("7", captcha.token, secret);
    expect(isValid).toBe(true);

    // handles whitespaces
    const isValidWithSpaces = verifyCaptcha(" 7  ", captcha.token, secret);
    expect(isValidWithSpaces).toBe(true);
  });

  it("should reject incorrect answers", () => {
    const num1 = 3;
    const num2 = 4;
    const captcha = generateCaptcha(num1, num2, secret);

    const isValid = verifyCaptcha("8", captcha.token, secret);
    expect(isValid).toBe(false);
  });

  it("should reject verification if secret differs", () => {
    const num1 = 3;
    const num2 = 4;
    const captcha = generateCaptcha(num1, num2, secret);

    const isValid = verifyCaptcha("7", captcha.token, "different_secret");
    expect(isValid).toBe(false);
  });
});
