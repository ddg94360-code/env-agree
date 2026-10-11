import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkEnv } from "../src/checks.js";
import { run } from "../bin/env-agree.js";

describe("checks", () => {
  it("passes when HOME and USERPROFILE are the same place", () => {
    const checks = checkEnv({ HOME: "C:/Users/a", USERPROFILE: "C:\\Users\\a" });
    assert.equal(checks.find((c) => c.name.startsWith("HOME")).ok, true);
  });

  it("fails when HOME was redirected somewhere else", () => {
    const checks = checkEnv({ HOME: "D:/sandbox/home", USERPROFILE: "C:/Users/a" });
    const check = checks.find((c) => c.name.startsWith("HOME"));
    assert.equal(check.ok, false);
    assert.match(check.detail, /sandbox/);
  });

  it("flags an npm prefix that is not the one npm would choose", () => {
    const checks = checkEnv({
      USERPROFILE: "C:/Users/a",
      APPDATA: "C:/Users/a/AppData/Roaming",
      NPM_CONFIG_PREFIX: "D:/tools/npm",
    });
    assert.equal(checks.find((c) => c.name === "npm prefix").ok, false);
  });

  it("skips a check when its variables are unset", () => {
    assert.deepEqual(checkEnv({}), []);
  });
});

describe("command line", () => {
  it("exits 1 when something disagrees", () => {
    const code = run([], { TEMP: "C:/a", TMP: "C:/b" }, () => {}, () => {});
    assert.equal(code, 1);
  });
});
