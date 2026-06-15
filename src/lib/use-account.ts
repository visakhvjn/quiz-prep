"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { AccountResponse } from "@/types/quiz";

const DEFAULT_ACCOUNT: AccountResponse = {
  plan: "hobby",
  limits: {
    maxQuestions: 5,
    minQuestions: 3,
    documentUpload: false,
    modelLabel: "Standard AI models",
    description: "Great for quick practice sessions",
  },
};

export function useAccount() {
  const [account, setAccount] = useState<AccountResponse>(DEFAULT_ACCOUNT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await apiFetch("/api/account");
        if (!response.ok) return;
        const payload = (await response.json()) as AccountResponse;
        setAccount(payload);
      } catch {
        setAccount(DEFAULT_ACCOUNT);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, []);

  return { account, isLoading };
}
