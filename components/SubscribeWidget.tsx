"use client";

import { useMemo, useState } from "react";

type SubscribeVariant = "hero" | "inline" | "footer";
type SubscribeStatus = "idle" | "loading" | "success" | "already" | "error";

type SubscribeWidgetProps = {
  variant: SubscribeVariant;
  source?: "hero" | "footer" | "tool" | "default";
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const variantStyles: Record<
  SubscribeVariant,
  {
    wrapper: string;
    form: string;
    input: string;
    button: string;
    message: string;
    label: string;
  }
> = {
  hero: {
    wrapper: "mt-8 max-w-2xl rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm",
    form: "mt-4 flex flex-col gap-3 sm:flex-row",
    input: "min-h-12 flex-1 rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10",
    button: "min-h-12 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400",
    message: "mt-3 text-sm leading-6",
    label: "text-base font-semibold text-slate-950",
  },
  inline: {
    wrapper: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
    form: "mt-4 flex flex-col gap-3 sm:flex-row",
    input: "min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10",
    button: "min-h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400",
    message: "mt-3 text-sm leading-6",
    label: "text-sm font-semibold uppercase tracking-wide text-slate-500",
  },
  footer: {
    wrapper: "w-full max-w-md",
    form: "mt-3 flex flex-col gap-2 sm:flex-row",
    input: "min-h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10",
    button: "min-h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400",
    message: "mt-2 text-xs leading-5",
    label: "text-sm font-semibold text-slate-950",
  },
};

const statusCopy: Record<Exclude<SubscribeStatus, "idle" | "loading">, string> = {
  success: "Subscribed. Check your inbox for the next digest.",
  already: "已订阅过",
  error: "Subscription failed, please try again later",
};

export function SubscribeWidget({ variant, source = "default" }: SubscribeWidgetProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [error, setError] = useState("");
  const styles = variantStyles[variant];
  const sourceValue = source || variant || "default";

  const message = useMemo(() => {
    if (status === "loading") {
      return "Subscribing...";
    }

    if (status === "error") {
      return error || statusCopy.error;
    }

    if (status === "idle") {
      return "";
    }

    return statusCopy[status];
  }, [error, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          source: sourceValue,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; already?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || statusCopy.error);
      }

      setEmail(trimmedEmail);
      setStatus(data.already ? "already" : "success");
    } catch (requestError) {
      setStatus("error");
      setError(requestError instanceof Error ? requestError.message : statusCopy.error);
    }
  }

  return (
    <section className={styles.wrapper} aria-label="Newsletter subscription">
      <p className={styles.label}>Weekly AI tools digest</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Get practical AI tools, prompt ideas, and creator workflow notes in your inbox.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") {
              setStatus("idle");
              setError("");
            }
          }}
          placeholder="you@example.com"
          className={styles.input}
          aria-label="Email address"
        />
        <button type="submit" disabled={status === "loading"} className={styles.button}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message ? (
        <p
          className={`${styles.message} ${
            status === "error"
              ? "text-red-700"
              : status === "success" || status === "already"
                ? "text-emerald-700"
                : "text-slate-500"
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
