const { execFileSync } = require("node:child_process");

const ports = ["3000", "3001"];

function processIdsForPort(port) {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
    return output.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function commandForPid(pid) {
  try {
    return execFileSync("ps", ["-p", pid, "-o", "command="], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

for (const port of ports) {
  for (const pid of processIdsForPort(port)) {
    const command = commandForPid(pid);
    if (command.includes("next-server") || command.includes("next dev")) {
      console.log(`Stopping Next dev server on port ${port} (pid ${pid})`);
      try {
        process.kill(Number(pid), "SIGTERM");
      } catch {
        // The process may have already exited.
      }
    }
  }
}
