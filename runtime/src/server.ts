import { Application } from "express";
import { createConsoleApp } from "@wingconsole/app";
import { readFile } from "fs/promises";

export interface StartServerProps {
  consolePath: string;
  entryfilePath: string;
  logfile: string;
}

export async function startServer({ consolePath, entryfilePath, logfile }: StartServerProps) {
  const wingConsole = require(consolePath);
  const create: typeof createConsoleApp = wingConsole.createConsoleApp;
  const { port } = await create({
    wingfile: entryfilePath,
    requestedPort: 3000,
    log: {
      info: console.log,
      error: console.error,
      verbose: console.log,
    },
    config: {
      addEventListener(event: any, listener: any) {},
      removeEventListener(event: any, listener: any) {},
      get(key: any) {
        return key;
      },
      set(key: any, value: any) {},
    },
    onExpressCreated: (app: Application) => {
      app.get("/logs", async (req, res) => {
        const data = await readFile(logfile, "utf-8");
        res.send(data);
      });
    }
  });
  console.log(`Console app opened on port ${port}`);
  return { port };
}
