import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const runtimeDbPath = "/tmp/shiftly.db";
const templateDbCandidates = [
  path.join(process.cwd(), "public", "seed", "shiftly-template.db"),
  path.join(process.cwd(), ".next", "server", "public", "seed", "shiftly-template.db"),
];

const dbStore = () => getStore({ name: "shiftly-db", consistency: "strong" });
const fileStore = () => getStore({ name: "shiftly-files", consistency: "strong" });

const dbBlobKey = "database/shiftly.sqlite";

let ready = false;
let loadingPromise: Promise<void> | null = null;
let savingPromise: Promise<void> | null = null;

function isNetlifyRuntimeEnv() {
  return process.env.NETLIFY === "true" || Boolean(process.env.SITE_ID) || Boolean(process.env.URL);
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

export function configureNetlifyDatabaseUrl() {
  if (!isNetlifyRuntimeEnv()) return;

  const dbUrl = process.env.DATABASE_URL;
  const shouldForceRuntimeSqlite =
    !dbUrl ||
    dbUrl === "file:./dev.db" ||
    dbUrl === "file:dev.db" ||
    (dbUrl.startsWith("file:") && dbUrl !== `file:${runtimeDbPath}`);

  if (shouldForceRuntimeSqlite) {
    process.env.DATABASE_URL = `file:${runtimeDbPath}`;
  }
}

async function copyTemplateDatabase() {
  for (const candidate of templateDbCandidates) {
    if (existsSync(candidate)) {
      await copyFile(candidate, runtimeDbPath);
      await chmod(runtimeDbPath, 0o600);
      return;
    }
  }

  throw new Error(
    `Shiftly template DB not found. Checked: ${templateDbCandidates.join(", ")}`,
  );
}

export async function ensureNetlifyDatabaseReady() {
  if (!isNetlifyRuntimeEnv() || ready) return;

  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    await mkdir("/tmp", { recursive: true });

    const existing = await dbStore().get(dbBlobKey, { type: "arrayBuffer", consistency: "strong" });

    if (existing) {
      await writeFile(runtimeDbPath, Buffer.from(existing));
      await chmod(runtimeDbPath, 0o600);
    } else {
      await copyTemplateDatabase();
      const bytes = await readFile(runtimeDbPath);
      await dbStore().set(dbBlobKey, toArrayBuffer(bytes));
    }

    ready = true;
    loadingPromise = null;
  })().catch(async (error) => {
    console.error("Failed to initialize Netlify DB blob. Falling back to template.", error);
    if (!existsSync(runtimeDbPath)) {
      await copyTemplateDatabase();
    }
    ready = true;
    loadingPromise = null;
  });

  await loadingPromise;
}

export async function persistNetlifyDatabase() {
  if (!isNetlifyRuntimeEnv()) return;

  await ensureNetlifyDatabaseReady();

  if (savingPromise) {
    await savingPromise;
    return;
  }

  savingPromise = (async () => {
    const bytes = await readFile(runtimeDbPath);
    await dbStore().set(dbBlobKey, toArrayBuffer(bytes));
    savingPromise = null;
  })().catch((error) => {
    console.error("Failed to persist Netlify DB blob", error);
    savingPromise = null;
  });

  await savingPromise;
}

export async function storeFileInNetlifyBlob(key: string, data: ArrayBuffer) {
  await fileStore().set(key, data);
}

export async function getFileFromNetlifyBlob(key: string) {
  return fileStore().get(key, { type: "arrayBuffer", consistency: "strong" });
}

export function isNetlifyRuntime() {
  return isNetlifyRuntimeEnv();
}
