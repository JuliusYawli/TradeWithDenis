const { spawn } = require("node:child_process");
const { rmSync } = require("node:fs");
const { join } = require("node:path");

require("./stop-next-dev");

console.log("Clearing generated Next.js cache (.next)");
rmSync(join(process.cwd(), ".next"), { recursive: true, force: true });

const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "-H", "127.0.0.1", "-p", "3000"], {
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
