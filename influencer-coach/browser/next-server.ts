export const NextResponse = {
  json(body: unknown, init?: { status?: number }) {
    return new Response(JSON.stringify(body), { status: init?.status ?? 200, headers: { "Content-Type": "application/json" } });
  },
};
