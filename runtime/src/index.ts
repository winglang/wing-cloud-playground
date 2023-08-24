import { run } from "./run";

const gitToken = process.env.GIT_TOKEN || "";
const repo = process.env.REPO || "eladcon/examples"
const entryfile = process.env.ENTRYFILE || "examples/redis/main.w";

run({ gitToken, repo, entryfile });
