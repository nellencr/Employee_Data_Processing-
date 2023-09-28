const axios = require('axios');

const googleSheetsLink = 'https://docs.google.com/spreadsheets/d/1eRujNQYov-tZ8j9yvkah6lSzJOpNweMF/gviz/tq?tqx=out:csv';

async function processData() {
  try {
    const response = await axios.get(googleSheetsLink);

    if (response.status !== 200) {
      throw new Error('Failed to fetch data.');
    }

    const data = response.data;
    const rows = data.split('\n').map(row => row.split(','));

    let consecutiveDays = {};
    let shiftTimings = {};
    const printedEmployees = new Set();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const employeeName = row[0];
      const position = row[1];
      const startTime = new Date(row[2]);
      const endTime = new Date(row[3]);

      if (!consecutiveDays[employeeName]) {
        consecutiveDays[employeeName] = [];
      }

      consecutiveDays[employeeName].push(endTime);

      if (consecutiveDays[employeeName].length >= 7 && !printedEmployees.has(employeeName)) {
        console.log(`${employeeName} has worked for 7 consecutive days.`);
        printedEmployees.add(employeeName);
      }

      if (shiftTimings[employeeName]) {
        const previousEndTime = shiftTimings[employeeName];
        const timeBetweenShifts = startTime - previousEndTime;
        const oneHourMillis = 60 * 60 * 1000;
        const tenHoursMillis = 10 * 60 * 60 * 1000;

        if (timeBetweenShifts > oneHourMillis && timeBetweenShifts < tenHoursMillis && !printedEmployees.has(employeeName)) {
          console.log(`${employeeName} has less than 10 hours between shifts.`);
          printedEmployees.add(employeeName);
        }
      }
      shiftTimings[employeeName] = endTime;

      const shiftDurationMillis = endTime - startTime;
      const fourteenHoursMillis = 14 * 60 * 60 * 1000;

      if (shiftDurationMillis > fourteenHoursMillis && !printedEmployees.has(employeeName)) {
        console.log(`${employeeName} has worked for more than 14 hours in a single shift.`);
        printedEmployees.add(employeeName);
      }
    }
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

processData();

