import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { get as getVercelBlob, put as putVercelBlob } from "@vercel/blob";

const runtimeDbPath = "/tmp/shiftly.db";
const templateDbCandidates = [
  path.join(process.cwd(), "public", "seed", "shiftly-template.db"),
  path.join(process.cwd(), ".next", "server", "public", "seed", "shiftly-template.db"),
];

const dbBlobKey = "database/shiftly.sqlite";

let ready = false;
let loadingPromise: Promise<void> | null = null;
let savingPromise: Promise<void> | null = null;
const MAX_BLOB_WRITE_ATTEMPTS = 3;
const BLOB_REFRESH_INTERVAL_MS = 1500;
let lastBlobSyncAt = 0;

function netlifyDbStore() {
  return getStore({ name: "shiftly-db", consistency: "strong" });
}

function netlifyFileStore() {
  return getStore({ name: "shiftly-files", consistency: "strong" });
}

function isNetlifyRuntimeEnv() {
  return process.env.NETLIFY === "true" || Boolean(process.env.SITE_ID) || Boolean(process.env.URL);
}

function isVercelRuntimeEnv() {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true" || Boolean(process.env.VERCEL_ENV);
}

function runtimeBlobProvider(): "netlify" | "vercel" | null {
  if (isNetlifyRuntimeEnv()) return "netlify";
  if (isVercelRuntimeEnv()) return "vercel";
  return null;
}

function isBlobRuntimeEnv() {
  return runtimeBlobProvider() !== null;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function isMissingBlobConfigurationError(error: unknown) {
  if (!(error instanceof Error)) return false;

  return (
    error.name === "MissingBlobsEnvironmentError" ||
    error.name === "BlobStoreNotFoundError" ||
    /BLOB_READ_WRITE_TOKEN/i.test(error.message) ||
    /No token found/i.test(error.message)
  );
}

async function readDatabaseBlob(): Promise<ArrayBuffer | null> {
  const provider = runtimeBlobProvider();
  if (!provider) return null;

  if (provider === "netlify") {
    return netlifyDbStore().get(dbBlobKey, { type: "arrayBuffer", consistency: "strong" });
  }

  const response = await getVercelBlob(dbBlobKey, { access: "private" });
  if (!response || response.statusCode !== 200 || !response.stream) return null;
  return new Response(response.stream).arrayBuffer();
}

async function writeDatabaseBlob(bytes: Buffer) {
  const provider = runtimeBlobProvider();
  if (!provider) return;

  if (provider === "netlify") {
    await netlifyDbStore().set(dbBlobKey, toArrayBuffer(bytes));
    return;
  }

  await putVercelBlob(dbBlobKey, bytes, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    contentType: "application/octet-stream",
  });
}

async function readFileBlob(key: string): Promise<ArrayBuffer | null> {
  const provider = runtimeBlobProvider();
  if (!provider) return null;

  if (provider === "netlify") {
    return netlifyFileStore().get(key, { type: "arrayBuffer", consistency: "strong" });
  }

  const response = await getVercelBlob(key, { access: "private" });
  if (!response || response.statusCode !== 200 || !response.stream) return null;
  return new Response(response.stream).arrayBuffer();
}

async function writeFileBlob(key: string, data: ArrayBuffer) {
  const provider = runtimeBlobProvider();
  if (!provider) return;

  if (provider === "netlify") {
    await netlifyFileStore().set(key, data);
    return;
  }

  await putVercelBlob(key, Buffer.from(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
  });
}

export function configureBlobBackedDatabaseUrl() {
  if (!isBlobRuntimeEnv()) return;

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

async function refreshRuntimeDatabaseFromBlob() {
  const existing = await readDatabaseBlob();
  if (!existing) return;

  await writeFile(runtimeDbPath, Buffer.from(existing));
  await chmod(runtimeDbPath, 0o600);
  lastBlobSyncAt = Date.now();
}

async function copyTemplateDatabase() {
  for (const candidate of templateDbCandidates) {
    if (existsSync(candidate)) {
      await copyFile(candidate, runtimeDbPath);
      await chmod(runtimeDbPath, 0o600);
      return;
    }
  }

  throw new Error(`Shiftly template DB not found. Checked: ${templateDbCandidates.join(", ")}`);
}

export async function ensureBlobDatabaseReady(options?: { preferLocal?: boolean }) {
  if (!isBlobRuntimeEnv()) return;

  if (ready) {
    if (options?.preferLocal) return;
    if (savingPromise) return;
    if (Date.now() - lastBlobSyncAt < BLOB_REFRESH_INTERVAL_MS) return;

    if (loadingPromise) {
      await loadingPromise;
      return;
    }

    loadingPromise = (async () => {
      await refreshRuntimeDatabaseFromBlob();
      loadingPromise = null;
    })().catch((error) => {
      console.error("Failed to refresh runtime DB from blob", error);
      loadingPromise = null;
    });

    await loadingPromise;
    return;
  }

  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    await mkdir("/tmp", { recursive: true });

    const existing = await readDatabaseBlob();

    if (existing) {
      await writeFile(runtimeDbPath, Buffer.from(existing));
      await chmod(runtimeDbPath, 0o600);
      lastBlobSyncAt = Date.now();
    } else {
      await copyTemplateDatabase();
      const bytes = await readFile(runtimeDbPath);
      await writeDatabaseBlob(bytes);
      lastBlobSyncAt = Date.now();
    }

    ready = true;
    loadingPromise = null;
  })().catch(async (error) => {
    loadingPromise = null;

    if (isMissingBlobConfigurationError(error) && process.env.NODE_ENV !== "production") {
      console.error("Blob storage unavailable in non-production. Falling back to template DB.", error);
      if (!existsSync(runtimeDbPath)) {
        await copyTemplateDatabase();
      }
      ready = true;
      return;
    }

    ready = false;
    console.error("Failed to initialize blob-backed DB.", error);
    throw error;
  });

  await loadingPromise;
}

export async function persistBlobDatabase() {
  if (!isBlobRuntimeEnv()) return;

  await ensureBlobDatabaseReady();

  if (savingPromise) {
    await savingPromise;
    return;
  }

  savingPromise = (async () => {
    const bytes = await readFile(runtimeDbPath);
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_BLOB_WRITE_ATTEMPTS; attempt += 1) {
      try {
        await writeDatabaseBlob(bytes);
        lastBlobSyncAt = Date.now();
        savingPromise = null;
        return;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_BLOB_WRITE_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 75));
        }
      }
    }

    savingPromise = null;
    console.error("Failed to persist DB blob after retries", lastError);
    throw lastError;
  })().catch((error) => {
    savingPromise = null;
    throw error;
  });

  await savingPromise;
}

export async function storeFileInBlob(key: string, data: ArrayBuffer) {
  await writeFileBlob(key, data);
}

export async function getFileFromBlob(key: string) {
  return readFileBlob(key);
}

export function isBlobRuntime() {
  return isBlobRuntimeEnv();
}

// Backward-compatible exports for existing imports.
export const configureNetlifyDatabaseUrl = configureBlobBackedDatabaseUrl;
export const ensureNetlifyDatabaseReady = ensureBlobDatabaseReady;
export const persistNetlifyDatabase = persistBlobDatabase;
export const storeFileInNetlifyBlob = storeFileInBlob;
export const getFileFromNetlifyBlob = getFileFromBlob;
export const isNetlifyRuntime = isNetlifyRuntimeEnv;
