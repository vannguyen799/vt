import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const beforeSha = process.env.BEFORE_SHA;
const manifests = (process.env.VERSION_MANIFESTS ?? "")
  .split(/\s+/)
  .filter(Boolean);

if (!beforeSha || /^0+$/.test(beforeSha)) {
  console.log("No previous revision is available; keeping the submitted versions.");
  process.exit(0);
}

if (manifests.length === 0) {
  throw new Error("VERSION_MANIFESTS must contain at least one manifest path.");
}

const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

for (const manifest of manifests) {
  const currentSource = readFileSync(manifest, "utf8");
  const current = JSON.parse(currentSource);

  let previous;
  try {
    previous = JSON.parse(
      execFileSync("git", ["show", `${beforeSha}:${manifest}`], {
        encoding: "utf8",
      }),
    );
  } catch {
    console.log(`${manifest}: new manifest; keeping ${current.version}.`);
    continue;
  }

  if (previous.version !== current.version) {
    console.log(
      `${manifest}: version already changed (${previous.version} -> ${current.version}).`,
    );
    continue;
  }

  const match = String(current.version).match(versionPattern);
  if (!match) {
    throw new Error(
      `${manifest}: "${current.version}" is not a supported x.y.z version.`,
    );
  }

  const patch = Number(match[3]);
  if (!Number.isSafeInteger(patch) || patch === Number.MAX_SAFE_INTEGER) {
    throw new Error(`${manifest}: patch component cannot be incremented safely.`);
  }

  const nextVersion = `${match[1]}.${match[2]}.${patch + 1}`;
  const versionField = /"version"\s*:\s*"[^"]+"/;
  const fieldMatch = currentSource.match(versionField);
  if (!fieldMatch) {
    throw new Error(`${manifest}: could not locate the version field.`);
  }

  const updatedField = fieldMatch[0].replace(
    `"${current.version}"`,
    `"${nextVersion}"`,
  );
  if (updatedField === fieldMatch[0]) {
    throw new Error(`${manifest}: version field does not match parsed JSON.`);
  }

  writeFileSync(
    manifest,
    currentSource.replace(versionField, updatedField),
    "utf8",
  );
  console.log(`${manifest}: ${current.version} -> ${nextVersion}`);
}
