const DataTransport = require('./DataTransport');

class DateService {
  constructor() {
    /**
     * type IHolidaysByMonthData = {
        "month": 1,
        "days": "1,2,3,4,5,6,7,8,12,13*,19,20,26,27"
      }
     * День со звездочкой - предпраздничный рабочий день
     * @type IHolidaysByMonthData[]
     * @private
     */
    this._holidaysData = [];

    this.isCurrentDayHoliday = this.isCurrentDayHoliday.bind(this);
    this._loadHolidaysData = this._loadHolidaysData.bind(this);
    this._getDateParts = this._getDateParts.bind(this);
  }

  async isCurrentDayHoliday() {
    if (this._holidaysData.length === 0) {
      this._holidaysData = await this._loadHolidaysData();
    }
    const [currentDay, currentMonth, year] = this._getDateParts(new Date());
    const currentMonthHolidaysData = this._holidaysData.find((i) => i.month === currentMonth);
    if (!currentMonthHolidaysData) {
      return false;
    }

    return currentMonthHolidaysData.days
      .split(',')
      .filter((i) => !i.includes('*'))
      .map((i) => parseInt(i.trim()))
      .includes(currentDay);
  }

  /**
   * Получает данные о выходных днях, используя сервис:
   * http://xmlcalendar.ru/data/ru/2021/calendar.json
   * Проект на github: https://github.com/xmlcalendar/data
   * @private
   */
  async _loadHolidaysData() {
    const [day, month, year] = this._getDateParts(new Date());
    let result = null;
    try {
      result = await DataTransport.get(`http://xmlcalendar.ru/data/ru/${year}/calendar.json`);
    } catch (e) {}

    return (result && result.months) || [];
  }

  /**
   *
   * @param date: Date
   * @returns [day: number, month: number, year: number]
   * @private
   */
  _getDateParts(date) {
    return date
      .toLocaleString('ru', {
        timeZone: process.env.TIMEZONE,
      })
      .split(',')[0]
      .split('.')
      .map((i) => parseInt(i.trim()));
  }
}

module.exports = new DateService();
