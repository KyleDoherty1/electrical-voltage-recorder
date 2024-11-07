const fs = require('fs');

function parseToFloat(input) {
    return isNaN(parseFloat(input)) ? 0.0 : parseFloat(input);
}

function writeToCsv(sensorReadings, logFilePath) {
    const timestamp = new Date().toISOString();
    console.log(`Timestamp: ${timestamp} - (${JSON.stringify(sensorReadings)}) `);

    const {l1VoltageReading, l2VoltageReading, l3VoltageReading, currentReading} = sensorReadings
    const csvRow = `${timestamp},${l1VoltageReading},${l2VoltageReading},${l3VoltageReading},${currentReading}\n`;

    // Check if the file exists; if not, write the header
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, 'Timestamp,L1 Voltage, L2 Voltage, L3 Voltage, Current\n');
    }
    fs.appendFileSync(logFilePath, csvRow);
}

module.exports = {
    parseToFloat,
    writeToCsv,
  };