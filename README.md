# env-agree

Report when the environment variables that decide where tools read and write
point at different places.

```
disagree: HOME and USERPROFILE: HOME=D:\sandbox\home but USERPROFILE=C:\Users\a
ok: TEMP and TMP: TEMP=C:\Users\a\AppData\Local\Temp
```

## The problem it exists for

Programs do not agree on which variable to trust. Git reads `HOME`, Windows
APIs read `USERPROFILE`, and npm uses `APPDATA` unless `NPM_CONFIG_PREFIX`
overrides it. Sandboxes, containers and environment managers redirect some of
these and not others. The symptom is "I changed the config and nothing
happened", because the program you configured and the program you ran are
reading two different directories.

env-agree compares the pairs that cause that, and says nothing when they
agree.

## Install

```
npm install env-agree
```

Node 18 or newer. No dependencies.

## Use

```
env-agree
```

Exit code `0` when every pair agrees (or there was nothing to compare), `1`
when at least one pair points at different places. Unset variables are
skipped, not reported as failures.

The checks:

- `HOME` against `USERPROFILE`
- `TEMP` against `TMP`
- `NPM_CONFIG_PREFIX` against the prefix npm would compute from `APPDATA`
- `NPM_CONFIG_CACHE` against the cache npm would compute from `LOCALAPPDATA`
