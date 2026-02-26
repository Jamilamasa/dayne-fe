"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const MANAGE_TOKEN_STORAGE_KEY = "dayne:last_manage_token";

function extractManageToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (!trimmed.includes("/")) {
    return trimmed;
  }

  try {
    const asURL = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? new URL(trimmed)
      : new URL(`http://placeholder${trimmed.startsWith("/") ? "" : "/"}${trimmed}`);
    const parts = asURL.pathname.split("/").filter(Boolean);
    const manageIndex = parts.indexOf("manage");
    if (manageIndex >= 0 && parts[manageIndex + 1]) {
      return parts[manageIndex + 1];
    }
  } catch {
    return "";
  }

  return "";
}

export function OpenRepaymentForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [storedToken, setStoredToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem(MANAGE_TOKEN_STORAGE_KEY) ?? "";
    setStoredToken(token);
  }, []);

  const hasStoredToken = useMemo(() => storedToken.trim().length > 0, [storedToken]);

  function openByToken(token: string) {
    const clean = token.trim();
    if (!clean) {
      setError("Enter a valid manage token or manage URL.");
      return;
    }
    setError(null);
    router.push(`/manage/${clean}`);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = extractManageToken(input);
    if (!token) {
      setError("Could not detect a manage token. Paste the full manage link or just the token.");
      return;
    }
    openByToken(token);
  }

  return (
    <section className="panel">
      <h2>Open Repayment Page</h2>
      <p>To record a new payment and upload receipt, open your private manage link.</p>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="full-width">
          Paste your manage URL or token
          <input
            placeholder="https://dayne.com/manage/your-token"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <button type="submit">Open Repayment Dashboard</button>
      </form>

      {hasStoredToken ? (
        <button className="ghost" onClick={() => openByToken(storedToken)}>
          Open Last Repayment Dashboard
        </button>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

export function persistManageTokenFromURL(manageURL?: string): void {
  if (!manageURL) {
    return;
  }
  const token = extractManageToken(manageURL);
  if (!token) {
    return;
  }
  window.localStorage.setItem(MANAGE_TOKEN_STORAGE_KEY, token);
}
