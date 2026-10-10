import { toNextJsHandler } from "better-auth/next-js";

async function getAuthHandlers() {
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth);
}

export async function GET(request: Request) {
  return (await getAuthHandlers()).GET(request);
}

export async function POST(request: Request) {
  return (await getAuthHandlers()).POST(request);
}