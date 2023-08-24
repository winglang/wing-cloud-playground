import { writeFileSync, openSync, createReadStream, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

export interface ExecProps {
  cwd?: string; 
  throwOnFailure?: boolean
};

export class Executer {
  logfile: string;
  outfile: number;
  errfile: number;
  constructor(logfile: string) {
    writeFileSync(logfile, "", "utf-8");
    createReadStream(logfile).pipe(process.stdout);
    this.logfile = logfile;
    this.errfile = openSync(logfile, 'a');
    this.outfile = openSync(logfile, 'a');
  }

  async exec(command: string, args: string[], options?: ExecProps) {
    appendFileSync(this.logfile, `Running ${command} ${args}\n`, "utf-8");
    const subprocess = spawnSync(command, args, {
      cwd: options?.cwd,
      stdio: [ 'ignore', this.outfile, this.errfile ]
    });
    appendFileSync(this.logfile, `Command ${command} exited with status ${subprocess.status}\n`, "utf-8");
    if (options?.throwOnFailure && (subprocess.status !== 0 || subprocess.status === null)) {
      throw new Error(`command ${command} failed with status ${subprocess.status}`);
    }
    return subprocess.status;
  }
}
