import Command from "../../base-command"
import { Template } from "../../../entity";
import { readFile } from "fs/promises";

export default class Import extends Command {
  static description = `import html template`;
  static args = [
    {
      name: "name",
      description: "name under which the template will be identified",
      required: true,
    },
    {
      name: "html",
      description: "file path to the html template",
      required: true,
    },
  ];

  async run() {
    const { args } = await this.parse(Import);

    const templateRepo = this.dataSource.getRepository(Template);
    const htmlContent = await readFile(args.html, { encoding: "utf8" });

    let template = await templateRepo.findOneBy({ name: args.name });
    if (template === null) template = new Template();

    template.name = args.name;
    template.content = htmlContent;

    await templateRepo.save(template);

    this.log("Stored template", { id: template.id, name: template.name });
  }
}
