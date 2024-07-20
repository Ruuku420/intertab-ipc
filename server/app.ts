import handler from "./handler.ts";

if (import.meta.main) {
  const ac = new AbortController();

  const server = Deno.serve({
    port: 80,
    handler: handler,
    signal: ac.signal,
  });

  server.finished.then(() => console.log("Server Closed"));
}
