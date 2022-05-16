import "reflect-metadata"
import { Command } from "@oclif/core"
import { initializeDataSource } from "../data-source"
import { DataSource } from "typeorm";

export default abstract class extends Command {
  dataSource!: DataSource;

  async init() {
    await super.init();

    this.dataSource = await initializeDataSource(this.config.dataDir);
  }
}
