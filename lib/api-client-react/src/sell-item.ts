import { customFetch } from "./custom-fetch";

export type SellItemResult = { goldEarned: number; gold: number };

export const sellMyPlayerItem = async (
  instanceId: string,
  options?: RequestInit,
): Promise<SellItemResult> => {
  return customFetch<SellItemResult>(
    `/api/players/me/items/${encodeURIComponent(instanceId)}`,
    { ...options, method: "DELETE" },
  );
};
