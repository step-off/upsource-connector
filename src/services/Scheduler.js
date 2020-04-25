const CronJob = require('cron').CronJob;
const Logger = require('./Logger');

class Scheduler {
  scheduleJob({ cronTime, onTick }) {
    if (!cronTime || !onTick) {
      Logger.error('cronTime & onTick are required to schedule a job!');
    }

    try {
      new CronJob({
        start: true,
        timeZone: 'Etc/GMT',
        cronTime,
        onTick,
      });
    } catch (e) {
      Logger.error(`Error with CronJob scheduling: `, e);
    }
  }
}

const instance = new Scheduler();

module.exports = instance;
