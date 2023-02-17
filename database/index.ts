import { createTables } from "./createDB";

export async function main() {
  const DB = await createTables(false);
  return DB;
}

export type DB = Awaited<ReturnType<typeof main>>;
