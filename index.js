const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { SerialPort } = require('serialport');

const serialport = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600 });

const localReadingFilePath= path.join(__dirname, 'readings.csv');

const env = 'local';

function writeToCsv(sensorReadings) {
    const timestamp = new Date().toISOString();
    console.log(`Timestamp: ${timestamp} - (${JSON.stringify(sensorReadings)}) `);

    const {l1VoltageReading, l2VoltageReading, l3VoltageReading, currentReading} = sensorReadings
    const csvRow = `${timestamp},${l1VoltageReading},${l2VoltageReading},${l3VoltageReading},${currentReading}\n`;

    // Check if the file exists; if not, write the header
    if (!fs.existsSync(localReadingFilePath)) {
        fs.writeFileSync(localReadingFilePath, 'Timestamp,L1 Voltage, L2 Voltage, L3 Voltage, Current\n');
    }
    fs.appendFileSync(localReadingFilePath, csvRow);
}

function parseToFloat(input) {
    return isNaN(parseFloat(input)) ? 0.0 : parseFloat(input);
}


// Buffer to hold incoming serial data
let serialBuffer = '';

serialport.on('data', (data) => {
    // Append new data to the buffer
    serialBuffer += data.toString();

    // Check if there's a complete line (ending with a newline character)
    let newLineIndex;
    while ((newLineIndex = serialBuffer.indexOf('\n')) >= 0) {
        const sensorReadingsAsSerialReading = serialBuffer.substring(0, newLineIndex).trim();
        serialBuffer = serialBuffer.substring(newLineIndex + 1);

        const [l1VoltageReading, l2VoltageReading, l3VoltageReading, currentReading] = sensorReadingsAsSerialReading.split(',');

        const sensorReadings = {
            l1VoltageReading: parseToFloat(l1VoltageReading),
            l2VoltageReading: parseToFloat(l2VoltageReading),
            l3VoltageReading: parseToFloat(l3VoltageReading),
            currentReading: parseToFloat(currentReading)
        };

        writeToCsv(sensorReadings);
    }
});
