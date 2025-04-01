const cron = require("node-cron");
const { sendAssignmentReminders } = require("./controllers/assignmentController");
const logger = require("../src/utils/logger");

const scheduleCronJobs = () => {
    cron.schedule("0 0 * * *", async () => {
      logger.info("Running reminder job...");
      try {
        await sendAssignmentReminders({ excludeExpired: true });
        logger.info("Assignment reminders sent successfully.");
      } catch (error) {
        logger.error("Error sending assignment reminders: " + error.message);
      }
    });
  
    logger.info("Cron jobs scheduled successfully.");
  };
  
  module.exports = scheduleCronJobs;