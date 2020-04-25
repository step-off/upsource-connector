const CronJob = require('cron').CronJob;

class Scheduler {
  scheduleJob({ cronTime, onTick }) {
    if (!cronTime || !onTick) {
      console.error('cronTime & onTick are required to schedule a job!');
    }

    return new CronJob({
      start: true,
      timeZone: 'Etc/GMT',
      cronTime,
      onTick,
    });
  }
}

const instance = new Scheduler();

module.exports = instance;
