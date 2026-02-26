"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link, ArrowRight, History } from "lucide-react";

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
    const asURL =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
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

  useEffect(() => {
    const token = window.localStorage.getItem(MANAGE_TOKEN_STORAGE_KEY) ?? "";
    setStoredToken(token);
  }, []);

  const hasStoredToken = useMemo(() => storedToken.trim().length > 0, [storedToken]);

  function openByToken(token: string) {
    const clean = token.trim();
    if (!clean) {
      toast.error("Enter a valid manage token or manage URL.");
      return;
    }
    router.push(`/manage/${clean}`);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = extractManageToken(input);
    if (!token) {
      toast.error("Could not detect a manage token. Paste the full manage link or just the token.");
      return;
    }
    openByToken(token);
  }

  return (
    <section className="panel">
      <h2>
        <ArrowRight size={18} />
        Open Repayment Page
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: "0.9rem", color: "var(--ink-muted)" }}>
        Paste your private manage link to record a new payment and upload your receipt.
      </p>
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="full-width">
          <span className="label-row">
            <Link size={12} />
            Manage URL or Token
          </span>
          <input
            placeholder="https://…/manage/your-token"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="full-width">
          <button type="submit" style={{ width: "100%" }}>
            <ArrowRight size={16} />
            Open Dashboard
          </button>
        </div>
      </form>

      {hasStoredToken ? (
        <button
          className="ghost"
          onClick={() => openByToken(storedToken)}
          style={{ marginTop: 12, width: "100%" }}
          data-tooltip="Continue where you left off"
        >
          <History size={15} />
          Resume Last Dashboard
        </button>
      ) : null}
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
