import "reflect-metadata"
import { Command } from "@oclif/core"
import { initializeDataSource } from "../data-source"
import { DataSource } from "typeorm";
import * as yaml from "js-yaml";
import { readFile } from "fs/promises";
import * as path from "path";

interface UserConfig {
  clickSend: { username: string, password: string },
  senderNr: string,
}

export default abstract class extends Command {
  dataSource!: DataSource;
  userConfig!: UserConfig;

  async init() {
    await super.init();

    this.dataSource = await initializeDataSource(this.config.dataDir);
    this.userConfig = yaml.load(await readFile(
      path.join(this.config.configDir, "config.yml"),
      "utf8",
    )) as UserConfig;
  }
}
