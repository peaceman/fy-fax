import * as inquirer from "inquirer";
import { Repository } from "typeorm";
import { Run } from "../../entity";

export async function promptForRun(repo: Repository<Run>, message: string): Promise<Run> {
  const runs = await repo.find();

  const answers = await inquirer
    .prompt({
      type: "list",
      name: "run",
      message,
      choices: runs.map(run => ({ name:
        `${run.name} from ${run.createdAt.toISOString()}`,
        value: run ,
      })),
    });

  return answers.run;
}
