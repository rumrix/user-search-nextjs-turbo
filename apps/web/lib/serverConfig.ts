export const fetchBaseUrl = () => {
  // Prefer the actual runtime port (useful for dev/e2e where PORT is 3001)
  if (process.env.PORT) return `http://localhost:${process.env.PORT}`;
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicUrl) return publicUrl.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};
