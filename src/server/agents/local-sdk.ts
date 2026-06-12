import "server-only";

import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  SqliteLocalAgentStore,
  type LocalAgentOptions,
  type LocalAgentStore,
} from "@cursor/sdk";

function isServerlessDeploy(): boolean {
  if (process.env.CURSOR_SDK_STATE_ROOT) return true;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  if (process.env.VERCEL) return true;
  if (process.cwd().startsWith("/var/task")) return true;
  return false;
}

function getSdkStateRoot(): string | undefined {
  if (process.env.CURSOR_SDK_STATE_ROOT) {
    return process.env.CURSOR_SDK_STATE_ROOT;
  }
  if (!isServerlessDeploy()) return undefined;
  return path.join(os.tmpdir(), "cursor-sdk-agent-store");
}

let storePromise: Promise<SqliteLocalAgentStore> | null = null;

export async function getLocalAgentStore(): Promise<LocalAgentStore | undefined> {
  const stateRoot = getSdkStateRoot();
  if (!stateRoot) return undefined;

  if (!storePromise) {
    mkdirSync(stateRoot, { recursive: true });
    storePromise = SqliteLocalAgentStore.open({
      workspaceRef: process.cwd(),
      stateRoot,
    });
  }

  return storePromise;
}

export async function buildLocalAgentOptions(
  options: Pick<LocalAgentOptions, "customTools"> = {},
): Promise<LocalAgentOptions> {
  const store = await getLocalAgentStore();
  return {
    cwd: process.cwd(),
    ...options,
    ...(store ? { store } : {}),
  };
}
