const CronJob = require('cron').CronJob;
const Logger = require('./Logger');
const DateService = require('./DateService');

class Scheduler {
  constructor() {
    this.scheduleJob = this.scheduleJob.bind(this);
    this._tickHandler = this._tickHandler.bind(this);
  }

  scheduleJob({ cronTime, onTick, skipOnHoliday }) {
    if (!cronTime || !onTick) {
      const message = 'cronTime & onTick are required to schedule a job!';
      Logger.error(message);
      throw new Error(message);
    }

    try {
      new CronJob({
        start: true,
        timeZone: 'Etc/GMT',
        cronTime,
        onTick: this._tickHandler.bind(this, onTick, skipOnHoliday),
      });
    } catch (e) {
      Logger.error(`Error with CronJob scheduling: `, e);
    }
  }

  async _tickHandler(originalHandler, skipOnHoliday) {
    if (skipOnHoliday) {
      const isHoliday = await DateService.isCurrentDayHoliday();
      if (isHoliday) {
        Logger.log('Current day is holiday. Skip job.');
        return;
      }
      return originalHandler();
    }
    originalHandler();
  }
}

const instance = new Scheduler();

module.exports = instance;
