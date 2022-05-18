import Command from "../../base-command";
import * as inquirer from "inquirer";
import { Recipient, Template, Run, Fax } from "../../../entity";
import * as crypto from "crypto";
import { spawn } from "child_process";
import { Readable } from "stream";
import { Repository, SelectQueryBuilder } from "typeorm";
import { map, pipe } from "iter-ops";

const MENU_ADD_FILTER = "addFilter";
const MENU_REMOVE_FILTER = "removeFilter";
const MENU_RESET_FILTERS = "resetFilters";
const MENU_CHECK_RECIPIENTS = "checkRecipients";
const MENU_CONTINUE = "continue";

export class Create extends Command {
  static description = `
    creates a run
  `;

  async run() {
    // select template
    const template = await this.promptForTemplate();

    // filter recipient list
    const recipientFilters = await this.promptForRecipientFilters();
    const name = await this.promptForRunName();

    await this.storeRunAndFaxes(name, template, recipientFilters);
  }

  async storeRunAndFaxes(
    name: string,
    template: Template,
    filters: RecipientFilter[],
  ): Promise<Run> {
    const run = new Run();
    run.name = name;
    run.template = template;

    await this.dataSource.transaction(async em => {
      await em.save(run);

      const recipientRepo = em.getRepository(Recipient);
      const qb = addRecipientFiltersToQueryBuilder(
        recipientRepo.createQueryBuilder("rec"),
        filters,
      );

      for await (const recipient of pageQuery(qb)) {
        const fax = new Fax();

        fax.run = run;
        fax.recipient = recipient;

        await em.save(fax);
      }
    });

    const amountOfFaxes = await this.dataSource.getRepository(Fax)
      .createQueryBuilder("fax")
      .innerJoin("fax.run", "run", "run.id = :runId", { runId: run.id })
      .getCount();

    this.log("Stored run", { name: run.name, amountOfFaxes });

    return run;
  }

  async promptForTemplate(): Promise<Template> {
    const repo = this.dataSource.getRepository(Template);
    const templates = await repo.createQueryBuilder("tpl")
      .select(["tpl.id", "tpl.name"])
      .getMany();

    const promptResult = await inquirer
      .prompt({
        type: "list",
        name: "template",
        message: "Which template should be used?",
        choices: templates.map(tpl => ({ name: tpl.name, value: tpl })),
      });

    return promptResult.template;
  }

  async promptForRecipientFilters(): Promise<RecipientFilter[]> {
    const repo = this.dataSource.getRepository(Recipient);
    const filters: RecipientFilter[] = [];

    loop:
    while (true) {
      const answer = await inquirer.prompt({
        type: "list",
        name: "menu",
        message: "Choose action",
        choices: [
          { value: MENU_ADD_FILTER, name: "Add filter" },
          { value: MENU_REMOVE_FILTER, name: "Remove filter" },
          { value: MENU_RESET_FILTERS, name: "Reset filters" },
          { value: MENU_CHECK_RECIPIENTS, name: "Check recipients" },
          { value: MENU_CONTINUE, name: "Continue" },
        ],
      });

      switch (answer.menu) {
        case MENU_ADD_FILTER:
          const filter = await this.promptForRecipientFilter();
          if (filter !== null)
            filters.push(filter);
          break;
        case MENU_REMOVE_FILTER:
          const filterToRemove = await this.promptForFilterToRemove(filters);
          if (filterToRemove !== null) {
            const idx = filters.findIndex(f => f.id === filterToRemove);
            if (idx !== -1) filters.splice(idx, 1);
          }
          break;
        case MENU_RESET_FILTERS:
          filters.splice(0, filters.length);
          break;
        case MENU_CHECK_RECIPIENTS:
          await this.checkRecipients(repo, filters);
          break;
        case MENU_CONTINUE:
          break loop;
      }

      this.log("Current filters: " + filters.map(recipientFilterStr).join(", "));
    }

    return filters;
  }

  async promptForRecipientFilter(): Promise<RecipientFilter | null> {
    const answer = await inquirer
      .prompt([
        {
          type: "input",
          name: "column",
          message: "CSV column to filter",
        },
        {
          type: "input",
          name: "regex",
          message: "LIKE Filter",
        },
      ]);

    const column = answer.column.trim();
    const regex = answer.regex.trim();

    if (column.length === 0 || regex.length === 0)
      return null;

    return {
      id: crypto.randomUUID(),
      column: answer.column,
      value: answer.regex,
    };
  }

  async promptForFilterToRemove(filters: RecipientFilter[]): Promise<string | null> {
    const answer = await inquirer
      .prompt([
        {
          name: "filter",
          type: "list",
          message: "Select filter to remove",
          choices: [
            ...filters.map(f => ({ name: recipientFilterStr(f), value: f.id })),
            new inquirer.Separator(),
            "Cancel",
          ],
        }
      ]);

    return answer.filter === "Cancel"
      ? null
      : answer.filter;
  }

  async checkRecipients(repo: Repository<Recipient>, filters: RecipientFilter[]): Promise<void> {
    const qb = addRecipientFiltersToQueryBuilder(
      repo.createQueryBuilder("rec"),
      filters,
    );

    const formatted = pipe(
      pageQuery(qb),
      map(recipient => `fax: ${recipient.faxNumber} | data: ${JSON.stringify(recipient.data)}\n`),
    );

    const child = spawn("less", {
      stdio: ["pipe", "inherit", "inherit"],
    });

    Readable.from(formatted).pipe(child.stdin);

    await new Promise<void>((resolve) => child.on("close", () => resolve()));
  }

  async promptForRunName(): Promise<string> {
    const answer = await inquirer
      .prompt({
        name: "name",
        type: "input",
        message: "Run Name",
        validate: v => v.length > 0,
      });

    return answer.name;
  }
}

interface RecipientFilter {
  id: string
  column: string
  value: string
}

function recipientFilterStr(filter: RecipientFilter): string {
  return `${filter.column}: ${filter.value}`;
}

async function* pageQuery<T>(qb: SelectQueryBuilder<T>, pageSize: number = 100) {
  let alreadyTaken = 0;

  while (true) {
    const results = await qb
      .skip(alreadyTaken)
      .take(pageSize)
      .getMany();

    yield* results;

    alreadyTaken += results.length;

    if (results.length === 0)
      break;
  }
}

function addRecipientFiltersToQueryBuilder(
  qb: SelectQueryBuilder<Recipient>,
  filters: RecipientFilter[]
): SelectQueryBuilder<Recipient> {
  for (const [idx, filter] of Object.entries(filters)) {
    qb.andWhere(
      `JSON_EXTRACT(${qb.alias}.data, :col_${idx}) LIKE :val_${idx}`,
      { [`col_${idx}`]: `$.${filter.column}`, [`val_${idx}`]: filter.value },
    );
  }

  return qb;
}
