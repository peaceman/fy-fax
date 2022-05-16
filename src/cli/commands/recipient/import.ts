import Command from "../../base-command";
import * as fs from "fs";
import { parse, Parser } from "csv-parse";
import { Flags } from "@oclif/core";
import * as inquirer from "inquirer";
import { Recipient } from "../../../entity";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export class Import extends Command {
  static description = `
    imports recipients from a given csv file
  `;

  static args = [
    {
      name: "csv",
      required: true,
      description: "csv file path",
    },
  ];

  static flags = {
    delimiter: Flags.string({
      default: ";",
      char: "d",
    }),
  };

  async run() {
    const { args, flags } = await this.parse(Import);

    const recipientRepo = this.dataSource.getRepository(Recipient);

    const parser = () => createParser(args.csv, flags.delimiter);
    const columnNames = await fetchCsvColumnNames(parser());
    const faxNumberColumnName = await promptForFaxNumberColumnName(columnNames);

    for await (const record of parser()) {
      const faxNumber = parseFaxNumber(record[faxNumberColumnName]);

      if (!faxNumber) {
        this.log("Skipping record; missing fax number", { record });
        continue;
      }

      let recipient = await recipientRepo.findOneBy({ faxNumber });
      if (!recipient) recipient = new Recipient();

      recipient.faxNumber = faxNumber;
      recipient.data = record;

      await recipientRepo.save(recipient);
    }
  }
}

async function fetchCsvColumnNames(parser: Parser): Promise<string[]> {
  for await (const record of parser) {
    return Object.keys(record);
  }

  return [];
}

function createParser(csvPath: string, delimiter: string): Parser {
  return fs
    .createReadStream(csvPath)
    .pipe(parse({
      columns: true,
      delimiter: delimiter,
      bom: true,
    }));
}

async function promptForFaxNumberColumnName(keys: string[]): Promise<string> {
  const responses = await inquirer.prompt([{
    name: "columnName",
    message: "Select the fax number column",
    type: "list",
    choices: keys.map(v => ({name: v})),
    loop: false,
  }]);

  return responses.columnName;
}

function parseFaxNumber(nr: string): string | undefined {
  const pnu = PhoneNumberUtil.getInstance();

  try {
    const parsedNr = pnu.parse(nr, "DE");
    return pnu.format(parsedNr, PhoneNumberFormat.E164);
  } catch {
    return undefined;
  }
}
