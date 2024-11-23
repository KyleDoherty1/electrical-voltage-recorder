#include "MCMVoltSense.h"  // Include MCM Volt Sense Library

MCMmeter l1VoltageReader;
MCMmeter l2VoltageReader;
MCMmeter l3VoltageReader;


const int ACPin = A3;           // Set the pin for the current sensor
const int l1LedPin = 13;          // Arduino's built-in LED pin

const int ledPin = 12;          // Arduino's built-in LED pin
#define ACTectionRange 20       // Set the sensor's detection range (e.g., 20A for a 20A sensor)
#define VREF 5.0                // Voltage reference for Arduino Uno
const float currentThreshold = 5.0;  // Current threshold in amps

float readACCurrentValue() {
  float peakVoltage = 0;  
  float voltageVirtualValue = 0;  // Vrms
  for (int i = 0; i < 5; i++) {
    peakVoltage += analogRead(ACPin);   // Read peak voltage
    delay(1);
  }
  peakVoltage = peakVoltage / 5;   
  voltageVirtualValue = peakVoltage * 0.707;    // Convert peak voltage to RMS

  // Convert to voltage, accounting for amplification
  voltageVirtualValue = (voltageVirtualValue / 1024 * VREF ) / 2;  
  float ACCurrtntValue = voltageVirtualValue * ACTectionRange;

  return ACCurrtntValue;
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);  // Set the LED pin as an output
    pinMode(l1LedPin, OUTPUT);  // Set the LED pin as an output

  l1VoltageReader.VoltageStp(A0, 142.12, 1.7);  // Voltage: input pin, calibration, phase_shift
  l2VoltageReader.VoltageStp(A1, 142.12, 1.7);
  l3VoltageReader.VoltageStp(A2, 142.12, 1.7);
}

void loop() {
  // Voltage readings
  l1VoltageReader.analogVoltage(50, 1000);  // Measure the AC voltage
  l2VoltageReader.analogVoltage(50, 1000);
  float l1VoltageVrms = l1VoltageReader.Vrms;
  float l2VoltageVrms = l2VoltageReader.Vrms;
  float l3VoltageVrms = l3VoltageReader.Vrms;

  // Current reading
  float ACCurrentValue = readACCurrentValue();  // Read AC current value

  // Check current against the threshold and control the LED
  if (ACCurrentValue > currentThreshold) {
    digitalWrite(ledPin, HIGH);  // Turn on the LED
  } else {
   // digitalWrite(ledPin, LOW);   // Turn off the LED
  }

   // Check current against the threshold and control the LED
  if (l1VoltageVrms > 230) {
    digitalWrite(l1LedPin, HIGH);  // Turn on the LED
  } else {
   digitalWrite(l1LedPin, LOW);   // Turn off the LED
  }

  // Print the voltage and current readings
  Serial.print("L1: ");
  Serial.print(l1VoltageVrms);
  Serial.print(", ");
  Serial.print("L2: ");
  Serial.print(l2VoltageVrms);
  Serial.print(", ");
  Serial.print("L3: ");
  Serial.print(l3VoltageVrms);
  Serial.print(", ");
  Serial.print("Current: ");
  Serial.print(ACCurrentValue);
  Serial.println("A");  // Print current in amps with units

  delay(1000);
}
