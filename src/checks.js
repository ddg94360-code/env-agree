/**
 * Compare the environment variables that decide where programs look for
 * config, and report the pairs that point at different places.
 *
 * Each check is a pure function of an env object, so the same logic runs in
 * tests and against the live process.
 */

import path from "node:path";

const WINDOWS = process.platform === "win32";

function value(env, key) {
  if (env[key] !== undefined) return env[key];
  if (!WINDOWS) return undefined;
  const found = Object.keys(env).find((name) => name.toLowerCase() === key.toLowerCase());
  return found ? env[found] : undefined;
}

function samePath(a, b) {
  if (a === undefined || b === undefined) return false;
  const left = path.resolve(a);
  const right = path.resolve(b);
  return WINDOWS ? left.toLowerCase() === right.toLowerCase() : left === right;
}

/**
 * @returns {{name: string, ok: boolean, detail: string}[]}
 */
export function checkEnv(env) {
  const checks = [];

  const home = value(env, "HOME");
  const userprofile = value(env, "USERPROFILE");
  if (home && userprofile) {
    checks.push(result(
      "HOME and USERPROFILE",
      samePath(home, userprofile),
      `HOME=${home}`,
      `USERPROFILE=${userprofile}`,
    ));
  }

  const temp = value(env, "TEMP");
  const tmp = value(env, "TMP");
  if (temp && tmp) {
    checks.push(result("TEMP and TMP", samePath(temp, tmp), `TEMP=${temp}`, `TMP=${tmp}`));
  }

  const appdata = value(env, "APPDATA");
  const npmPrefix = value(env, "NPM_CONFIG_PREFIX");
  if (npmPrefix && userprofile) {
    const nativePrefix = appdata ? path.join(appdata, "npm") : path.join(userprofile, "AppData", "Roaming", "npm");
    checks.push(result(
      "npm prefix",
      samePath(npmPrefix, nativePrefix),
      `NPM_CONFIG_PREFIX=${npmPrefix}`,
      `npm's own default would be ${nativePrefix}`,
    ));
  }

  const npmCache = value(env, "NPM_CONFIG_CACHE");
  const localappdata = value(env, "LOCALAPPDATA");
  if (npmCache && localappdata) {
    checks.push(result(
      "npm cache",
      samePath(npmCache, path.join(localappdata, "npm-cache")),
      `NPM_CONFIG_CACHE=${npmCache}`,
      `npm's own default would be ${path.join(localappdata, "npm-cache")}`,
    ));
  }

  return checks;
}

function result(name, ok, left, right) {
  return { name, ok, detail: ok ? left : `${left} but ${right}` };
}
