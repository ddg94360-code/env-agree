#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { checkEnv } from "../src/checks.js";

const USAGE = `env-agree — report environment variables that disagree

Usage:
  env-agree

Checks HOME against USERPROFILE, TEMP against TMP, and NPM_CONFIG_PREFIX /
NPM_CONFIG_CACHE against the defaults npm would compute on its own. A check
is skipped when the variables it needs are unset. Exit code is 1 when any
pair points at different places.
`;

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  process.exitCode = run(process.argv.slice(2), process.env, console.log, console.error);
}

export function run(argv, env, log, error) {
  if (argv.includes("--help") || argv.includes("-h")) {
    log(USAGE);
    return 0;
  }
  const checks = checkEnv(env);
  if (checks.length === 0) {
    log("env-agree: nothing to compare (the relevant variables are unset)");
    return 0;
  }
  let bad = 0;
  for (const check of checks) {
    const line = `${check.ok ? "ok" : "disagree"}: ${check.name}: ${check.detail}`;
    if (check.ok) log(line);
    else {
      error(line);
      bad += 1;
    }
  }
  return bad > 0 ? 1 : 0;
}
