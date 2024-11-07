/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const { parseToFloat, writeToCsv } = require('./utils');

const serialport = new SerialPort(
  { path: '/dev/ttyACM0', baudRate: 9600 },
  (err) => {
    if (err) {
      return console.log('Error connecting to arduino: ', err.message);
    }
  },
);

let usbDriveInserted = false;
let logFilePath;

function configureUsb() {
  const mountFolder = '/media/liamdoherty';
  try {
    const usbDrives = fs.readdirSync(mountFolder);
    if (usbDrives.length > 0) {
      console.log(`USB drive detected and mounted to: ${usbDrives[0]}`);
      logFilePath = path.join(mountFolder, usbDrives[0], 'readings.csv');
      // Attempt to change permissions for write access
      usbDriveInserted = true;
    }
  } catch (err) {
    console.error('USB drive not detected:', err);
    usbDriveInserted = false;
  }
}

// Call once at startup and periodically to detect any changes in USB
configureUsb();

// Buffer to hold incoming serial data
let serialBuffer = '';

serialport.on('data', (data) => {
  if (usbDriveInserted === false) {
    console.warn('USB Drive not inserted');
    return false;
  }
  // Append new data to the buffer
  serialBuffer += data.toString();

  // Check if there's a complete line (ending with a newline character)
  let newLineIndex;
  while ((newLineIndex === serialBuffer.indexOf('\n')) >= 0) {
    const sensorReadingsAsSerialReading = serialBuffer
      .substring(0, newLineIndex)
      .trim();
    serialBuffer = serialBuffer.substring(newLineIndex + 1);

    const [
      l1VoltageReading,
      l2VoltageReading,
      l3VoltageReading,
      currentReading,
    ] = sensorReadingsAsSerialReading.split(',');

    const sensorReadings = {
      l1VoltageReading: parseToFloat(l1VoltageReading),
      l2VoltageReading: parseToFloat(l2VoltageReading),
      l3VoltageReading: parseToFloat(l3VoltageReading),
      currentReading: parseToFloat(currentReading),

    };
    configureUsb();
    if (usbDriveInserted === true) {
      writeToCsv(sensorReadings, logFilePath);
    }
  }
});
