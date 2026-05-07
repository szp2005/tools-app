type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret || !token) {
    return {
      success: false,
      reason: !secret ? "Turnstile secret is not configured." : "Turnstile token is missing.",
    };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);

  if (ip) {
    formData.append("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return {
      success: false,
      reason: "Turnstile verification request failed.",
    };
  }

  const result = (await response.json()) as TurnstileVerifyResponse;

  return {
    success: result.success,
    reason: result.success ? undefined : result["error-codes"]?.join(", "),
  };
}
