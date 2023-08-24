import { expect, test } from "vitest"
import { readFileSync } from "node:fs";
import fetch from 'node-fetch';
import { run } from "../src/run";

test("run() - public repo with npm packages", async () => {
  const { logfile, port } = await run({ repo: "eladcon/examples", entryfile: "examples/redis/main.w", gitToken: "" });

  const logs = readFileSync(logfile, "utf-8");
  expect(logs).toContain("pass ─ main.wsim » root/env0/test:Hello, world!");
  expect(logs).toContain("Running npm install\n\nadded 1 package");

  const response = await fetch(`http://localhost:${port}/logs`)
  expect(await response.text()).toEqual(logs);
});

test("run() - throws when repo not found", async () => {
  await expect(() => run({ repo: "eladcon/not-examples", entryfile: "examples/redis/main.w", gitToken: "" }))
    .rejects.toThrowError(/command git failed with status/);
});
