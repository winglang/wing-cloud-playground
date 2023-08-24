import { existsSync, mkdtempSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import resolveGlobal from "resolve-global";
import { Executer } from "./executer";

export interface SetupProps {
  e: Executer;
  repo: string;
  entryfile: string;
  gitToken: string;
}

export class Setup {
  e: Executer;
  repo: string;
  entryfile: string;
  gitToken: string;
  sourceDir: string;

  constructor({ e, repo, entryfile, gitToken }: SetupProps) {
    this.e = e;
    this.repo = repo;
    this.entryfile = entryfile;
    this.gitToken = gitToken;
    this.sourceDir = mkdtempSync(join(tmpdir(), "source-"));
  }

  async setup() {
    const entryfilePath = join(this.sourceDir, this.entryfile);
    const entrydir = dirname(entryfilePath);
    await this.gitClone(this.repo, this.sourceDir);
    await this.npmInstall(entrydir);
    const wingCli = await this.getWingPaths(entrydir);
    await this.wingTest(wingCli.winglang, entryfilePath)

    return { paths: wingCli, entryfilePath }; 
  }
  
  private async gitClone(repo: string, targetDir: string) {
    return this.e.exec("git", ["clone", `https://oauth2:${this.gitToken}@github.com/${repo}`, `${targetDir}`], { throwOnFailure: true });
  }
  
  private async npmInstall(cwd: string) {
    if (existsSync(join(cwd, "package.json"))) {
      return this.e.exec("npm", ["install"], { cwd, throwOnFailure: true });
    }
  }
  
  private async getWingPaths(cwd: string) {
    const getLocalWing = (cwd: string) => {
      try {
        const wingPath = require.resolve("winglang", { paths: [cwd] });
        return { "winglang": wingPath, "@wingconsole/app": require.resolve("@wingconsole/app", { paths: [cwd] }) };
      } catch (err) { 
        return null; 
      }
    };
  
    let paths = getLocalWing(cwd);
    if (!paths) {
      const wingDir = mkdtempSync(join(tmpdir(), "wing-"));
      await this.e.exec("npm", ["init", "-y"], { cwd: wingDir, throwOnFailure: true });
      await this.e.exec("npm", ["install", "winglang"], { cwd: wingDir, throwOnFailure: true });
      paths = getLocalWing(wingDir);
      if (!paths) {
        throw new Error("failed to installed winglang");
      }
    }
    
    return paths;
  }
  
  private async wingTest(wingPath: string, entryfile: string) {
    return this.e.exec("node", [wingPath, "test", entryfile], { cwd: dirname(entryfile) });
  }
}
