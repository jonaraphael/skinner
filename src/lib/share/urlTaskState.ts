const encodeBase64 = (value: string): string => {
  return btoa(unescape(encodeURIComponent(value)));
};

const decodeBase64 = (value: string): string => {
  return decodeURIComponent(escape(atob(value)));
};

export const encodeShareToken = (payload: unknown): string => {
  const raw = JSON.stringify(payload);
  return `v1.${encodeBase64(raw)}`;
};

export const decodeShareToken = (token: string): unknown | null => {
  if (!token.startsWith("v1.")) {
    return null;
  }
  try {
    const raw = decodeBase64(token.slice(3));
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
