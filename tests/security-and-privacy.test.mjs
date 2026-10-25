import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../next.config.ts";

test("global security headers are configured", async () => {
  const entries = await nextConfig.headers?.();
  const headers = new Map(entries?.[0]?.headers.map(({ key, value }) => [key, value]));
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.match(headers.get("Permissions-Policy") ?? "", /camera=\(\)/);
});
