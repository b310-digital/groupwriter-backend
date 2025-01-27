import { PrismaClient } from "@prisma/client";
import { CronJob } from "cron";
import { deleteOldDocuments } from "../model/document";

const SCHEDULE = "0 0 * * *";

export const scheduleRemoveOldDocumentsCronJob = (prisma: PrismaClient) => {
  CronJob.from({
    cronTime: SCHEDULE,
    onTick: async () => {
      console.log("Starting cronjob");
      if (process.env.FEATURE_REMOVE_DOCUMENTS_TOGGLE === "true") {
        console.log("Deleting old documents");
        await deleteOldDocuments(prisma);
      }
      console.log("Cronjob finished");
    },
    start: true,
  });
};
