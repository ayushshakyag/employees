const fs = require("fs");    
const csv = require("csv-parser");

const csvFilePath = "Assignment_Timecard_Sheet1.csv";

const employeeData = {}; // Store processed employee records.

function processData(row) {
  const employeeName = row["Employee Name"];
  const positionId = row["Position ID"];

  if (!employeeData[employeeName]) {
    employeeData[employeeName] = [];
  }

  employeeData[employeeName].push({ positionId, ...row });
}

function checkConsecutiveDays(employeeRecords, employeeName) {
  for (let i = 1; i < employeeRecords.length && i <= 7; i++) {
    const currentDate = new Date(employeeRecords[i].Date);
    const previousDate = new Date(employeeRecords[i - 1].Date);
    if (currentDate.getDate() - previousDate.getDate() !== 1) {
      break;
    }
    if (i === 7) {
      console.log(
        `${employeeName} (Position ID: ${employeeRecords[i].positionId}) worked for 7 consecutive days.`
      );
    }
  }
}

function checkShiftTiming(employeeRecords, employeeName) {
  for (let i = 1; i < employeeRecords.length; i++) {
    const startTime = new Date(employeeRecords[i - 1]["Time Out"]);
    const endTime = new Date(employeeRecords[i]["Time"]);
    const timeDiff = (endTime - startTime) / (1000 * 60 * 60);
    if (timeDiff > 1 && timeDiff < 10) {
      console.log(
        `${employeeName} (Position ID: ${employeeRecords[i].positionId}) has less than 10 hours between shifts.`
      );
      break;
    }
  }
}

function checkShiftDuration(employeeRecords, employeeName) {
  for (let i = 0; i < employeeRecords.length; i++) {
    const shiftHours = parseFloat(
      employeeRecords[i]["Timecard Hours (as Time)"]
    );
    if (shiftHours > 14) {
      console.log(
        `${employeeName} (Position ID: ${employeeRecords[i].positionId}) worked for more than 14 hours in a single shift.`
      );
      break;
    }
  }
}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    processData(row); // process csv file data
  })
  .on("end", () => {
    for (const employeeName in employeeData) {
      const employeeRecords = employeeData[employeeName];
      checkConsecutiveDays(employeeRecords, employeeName);
      checkShiftTiming(employeeRecords, employeeName);
      checkShiftDuration(employeeRecords, employeeName);
    }
  });
