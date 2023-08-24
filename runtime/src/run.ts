import { join } from "node:path";
import { tmpdir } from "node:os";
import { Executer } from "./executer";
import { startServer } from "./server";
import { Setup } from "./setup";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

export interface RunProps {
  repo: string;
  entryfile: string;
  gitToken: string;
};

export const run = async function ({ repo, entryfile, gitToken }: RunProps) {
  const logfile = join(tmpdir(), "log-" + randomBytes(8).toString("hex"));
  console.log(`Setup preview runtime. logfile ${logfile}`);

  try {
    const e = new Executer(logfile);
    const { paths, entryfilePath } = await new Setup({ e, repo, entryfile, gitToken }).setup();
    const { port } = await startServer({ consolePath: paths["@wingconsole/app"], entryfilePath, logfile });
    return { logfile, port };
  } catch (err) {
    console.error("preview runtime error", err, readFileSync(logfile, "utf-8"));
    throw err;
  }
};
