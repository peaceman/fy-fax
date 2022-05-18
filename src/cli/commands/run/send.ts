import { Flags } from "@oclif/core";
import { Fax, Run } from "../../../entity";
import Command from "../../base-command";
import { promptForRun } from "../../shared/prompts";
import { chunkQuery } from "../../shared/query";
import * as clicksend from "../../../infra/clicksend";
import { readFile } from "fs/promises";
import * as path from "path";

export class Send extends Command {
  static flags = {
    "test-nr": Flags.string({
      description: "Recipient fax nr override",
    }),
    force: Flags.boolean({
      description: "Force sending of already sent faxes",
      default: false,
    }),
  };

  async run() {
    const { flags } = await this.parse(Send);

    const run = await promptForRun(
      this.dataSource.getRepository(Run),
      "Which run should be sent?",
    );

    const faxesQb = this.dataSource.getRepository(Fax)
      .createQueryBuilder("fax")
      .innerJoinAndSelect("fax.recipient", "recipient")
      .innerJoin("fax.run", "run", "run.id = :runId", { runId: run.id })
      .andWhere("fax.pdfFilePath is not null");

    if (!flags.force)
      faxesQb.andWhere("fax.externalIdentifier is null");

    const faxCount = await faxesQb.getCount();
    let sentFaxes = 0;

    const sendFax = async (fax: Fax) => {
      const uploadUrl = await this.uploadFaxFile(fax.pdfFilePath);
      const logPrefix = `Fax: ${fax.identifier}`;

      const number = flags["test-nr"]
//        || "+61261111111";
        || fax.recipient.faxNumber;

      const externalIdentifier = await this.sendFax(
        fax.identifier,
        number,
        uploadUrl,
      );

      sentFaxes += 1;
      this.log(
        `${logPrefix} | sent ${sentFaxes} / ${faxCount} | `
        + `got external identifier ${externalIdentifier}`
      );

      fax.externalIdentifier = externalIdentifier;
      await this.dataSource.getRepository(Fax).save(fax);
    };

    for await (const faxes of chunkQuery(faxesQb, 100)) {
      await Promise.all(faxes.map(fax => sendFax(fax)));
    }
  }

  async uploadFaxFile(pdfFilePath: string): Promise<string> {
    const uploadApi = this.buildUploadApi();

    const uploadFile = new clicksend.UploadFile();
    uploadFile.content = await readFile(
      path.join(this.config.dataDir, pdfFilePath),
      { encoding: "base64" }
    );

    const uploadFileResponse = await uploadApi.uploadsPost(uploadFile, "fax");
    const body = uploadFileResponse.body as unknown as {
      data: {
        _url: string,
      },
    };

    return body.data._url;
  }

  async sendFax(
    internalIdentifier: string,
    faxNumber: string,
    fileUrl: string,
  ): Promise<string> {
    const faxApi = this.buildFaxApi();

    const faxMsg = new clicksend.FaxMessage();
    faxMsg.customString = internalIdentifier;
    faxMsg.source = "fy-fax";
    faxMsg.to = faxNumber;
    faxMsg.from = "+61261111111";

    const faxMsgCollection = new clicksend.FaxMessageCollection();
    faxMsgCollection.fileUrl = fileUrl;
    faxMsgCollection.messages = [faxMsg];

    const response = await faxApi.faxSendPost(faxMsgCollection);
    const body = response.body as unknown as {
      data: {
        messages: {
          message_id: string,
          status: string,
          custom_string: string,
        }[],
      },
    };

    const [msg] = body.data.messages;

    return msg.message_id;
  }

  buildFaxApi(): clicksend.FAXApi {
    const config = this.userConfig.clickSend;
    this.validateClickSendConfig(config);

    return new clicksend.FAXApi(config.username, config.password);
  }

  buildUploadApi(): clicksend.UploadApi {
    const config = this.userConfig.clickSend;
    this.validateClickSendConfig(config);

    return new clicksend.UploadApi(config.username, config.password);
  }

  validateClickSendConfig(config: Record<string, string>): void {
    if (!config.username || !config.password) {
      this.error("Missing clicksend username or password in config", { exit: 1 });
    }
  }
}
