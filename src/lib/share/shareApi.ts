export interface ShareCreateResponse {
  id: string;
  expiresAt: string;
}

export interface ShareFetchResponse {
  id: string;
  token: string;
  expiresAt: string;
}

const API_BASE = import.meta.env.VITE_SHARE_API_BASE as string | undefined;

export const canUseShareApi = (): boolean => Boolean(API_BASE);

export const createShare = async (token: string): Promise<ShareCreateResponse | null> => {
  if (!API_BASE) {
    return null;
  }
  const response = await fetch(`${API_BASE}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ShareCreateResponse;
};

export const fetchShare = async (id: string): Promise<ShareFetchResponse | null> => {
  if (!API_BASE) {
    return null;
  }
  const response = await fetch(`${API_BASE}/api/share/${id}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ShareFetchResponse;
};
