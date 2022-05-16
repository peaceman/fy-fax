import { DataSource } from "typeorm"
import * as path from "path"
import { Template } from "./entity";

let dataSource: DataSource | undefined;

const entities = [
  Template,
];

export async function initializeDataSource(dataDir: string): Promise<DataSource> {
  const dbFilePath = path.join(dataDir, "fy-fax.db");
  console.log("Initializing database", { path: dbFilePath });

  dataSource = new DataSource({
    type: "sqlite",
    database: dbFilePath,
    synchronize: true,
    entities,
  });

  return dataSource.initialize();
}

export function getDataSource(): DataSource {
  if (!dataSource) {
    throw new Error("Uninitialized DataSource");
  }

  return dataSource;
}
