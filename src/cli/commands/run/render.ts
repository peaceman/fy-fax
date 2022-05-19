import { Fax, Recipient, Run, Template } from "../../../entity";
import Command from "../../base-command";
import Fastify from "fastify";
import * as puppeteer from "puppeteer";
import { UrlPdfRenderer } from "../../../infra/url-pdf-renderer";
import PQueue from "p-queue";
import * as path from "path"
import * as crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { CliUx, Flags } from "@oclif/core";
import * as nunjucks from "nunjucks";
import { promptForRun } from "../../shared/prompts";
import { chunkQuery } from "../../shared/query";

export class Render extends Command {
  static description = `Render pdfs`
  static flags = {
    force: Flags.boolean({
      default: false,
      char: "f",
      description: "Force re-rendering of already existing pdfs"
    }),
    concurrency: Flags.integer({
      default: 25,
      char: "c",
      description: "How many pdfs should be rendered in parallel?"
    }),
  };

  async run() {
    const { flags } = await this.parse(Render);

    const run = await promptForRun(
      this.dataSource.getRepository(Run),
      "Which run should be rendered?",
    );

    const template = await this.loadTemplate(run);

    const fastify = Fastify({
      logger: {
        level: "error",
      },
    });

    fastify.get<{ Params: { recipientId: string } }>(
      "/:recipientId",
      async (request, reply) => {
        const recipient = await this.dataSource.getRepository(Recipient)
          .findOneByOrFail({ id: parseInt(request.params.recipientId) });

        const content = nunjucks.renderString(template.content, recipient.data);

        await reply
          .type("text/html")
          .send(content);
      },
    );

    const serverBaseUrl = await fastify.listen(0);

    const browser = await puppeteer.launch();
    const renderer = new UrlPdfRenderer(browser);

    try {
      const faxesQb = this.dataSource.getRepository(Fax)
        .createQueryBuilder("fax")
        .innerJoin("fax.run", "run", "run.id = :runId", { runId: run.id });

      if (!flags.force)
        faxesQb.andWhere("fax.pdfFilePath is null");

      const eligibleFaxes = await faxesQb.getCount();
      if (eligibleFaxes === 0) {
        this.log("Found no faxes that need rendering");
        return;
      }

      this.log("Found faxes to render", { count: eligibleFaxes });

      const pdfBaseDir = this.config.dataDir;
      const renderQueue = new PQueue({ concurrency: flags.concurrency });

      CliUx.ux.action.start("Rendering pdfs");
      for await (const faxes of chunkQuery(faxesQb, flags.concurrency * 2)) {
        const renderFaxPromises = faxes
          .map(async fax => {
            const url = `${serverBaseUrl}/${fax.recipientId}`;
            const pdfBuffer = await renderQueue.add(() => renderer.render(url));
            const pdfFilePath = fax.pdfFilePath ?? generatePdfFilePath();
            const absPdfFilePath = path.join(pdfBaseDir, pdfFilePath);

            await mkdir(path.dirname(absPdfFilePath), { recursive: true });
            await writeFile(path.join(pdfBaseDir, pdfFilePath), pdfBuffer);

            fax.pdfFilePath = pdfFilePath;
            await this.dataSource.getRepository(Fax).save(fax);
          });

        await Promise.all(renderFaxPromises);
      }
      CliUx.ux.action.stop();
    } finally {
      await fastify.close();
      await browser.close();
    }
  }

  async loadTemplate(run: Run): Promise<Template> {
    const template = this.dataSource.createQueryBuilder()
      .relation(Run, "template")
      .of(run)
      .loadOne();

    if (!template) {
      this.error("Couldn't find template for run", { exit: 1 });
    }

    return template;
  }
}

function generatePdfFilePath(): string {
  const uuid = crypto.randomUUID();

  const folderPart = uuid.slice(0, 6);
  const folderChunks: string[] = [];
  for (let idx = 0; idx < folderPart.length; idx += 2)
    folderChunks.push(folderPart.slice(idx, idx + 2));

  return path.join(
    ...folderChunks,
    `${uuid}.pdf`
  );
}
