import { test } from "node:test";
import assert from "node:assert/strict";
import { execWithClosedStdin } from "../scripts/subprocess.mjs";
test("noninteractive verification closes stdin so children waiting for EOF can start", async () => {
  const result = await execWithClosedStdin(
    process.execPath,
    [
      "-e",
      "process.stdin.resume();process.stdin.on('end',()=>console.log('received EOF'))",
    ],
    { timeout: 1000 },
  );
  assert.equal(result.stdout.trim(), "received EOF");
});
