const HOST = /^[a-z0-9.-]+(?::\d+)?$/i;

export function originFromForwarded(input: { host: string | null; protocol: string | null }) {
  const host = input.host?.split(",")[0]?.trim() ?? "";
  if (!HOST.test(host)) return "";
  const protocol = input.protocol === "https" ? "https" : "http";
  return `${protocol}://${host}`;
}
