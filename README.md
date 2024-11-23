
# Overview
This project uses an Arduino Uno to measure AC voltage and current using:
- Three voltage sensors (L1, L2 & L3) connected to pins `A0`, `A1` and `A2`.
- A Gravity Analog AC Current Sensor connected to pin `A3`.

The script calculates the root mean square (RMS) voltage and current values and prints them to the serial monitor for a Rasperry PI to read. It also controls a set of LED's. There are green LED's for each phase to indicate if voltage is being read and a red LED to indicate if a current fault has occured.

---

## Features

- Measures and prints the RMS voltage for three inputs (`l1`, `l2` & `l3`).
- Reads and prints the RMS current from the AC current sensor.
- Built-in or external LED lights up if the current exceeds 18 amps (configurable threshold).

---

## Components Used

1. **Arduino Uno**
2. **MCM Voltage Sensors**
   - Connected to `A0` and `A1`
   - Requires the [MCMVoltSense Library](https://github.com/mcmvintage/MCMVoltSense)
3. **Gravity Analog AC Current Sensor**
   - Connected to `A2`
   - [Gravity Sensor Documentation](https://wiki.dfrobot.com/Gravity_Analog_AC_Current_Sensor__SKU_SEN0211_)
4. **LED**
   - Built-in (pin `13`) or external (optional)

---

## Pin Configuration

| Component           | Arduino Pin | Notes                            |
|---------------------|-------------|----------------------------------|
| Voltage Sensor 1    | `A0`        | For `l1` voltage measurement    |
| Voltage Sensor 2    | `A1`        | For `l2` voltage measurement    |
| Voltage Sensor 3    | `21`        | For `l3` voltage measurement    |
| AC Current Sensor   | `A2`        | For current measurement          |
| L1 Voltage LED        | `13`        | Green to indicate voltage being read  |
| L2 Voltage LED        | `13`        | Green to indicate voltage being read  |
| L3 Voltage LED        | `13`        | Green to indicate voltage being read  |
| Current LED    | `9`         | Use red for threshold indication |

![IMG_20241123_144246](https://github.com/user-attachments/assets/26f52852-ceeb-4038-8206-02b6eea9ec8b)


---

## Installation

### Prerequisites
1. Install the Arduino IDE.
2. Install the **MCMVoltSense Library**:
   - Download it from [here](https://github.com/mcmvintage/MCMVoltSense).
   - Add the library to the Arduino IDE:
     - Go to **Sketch > Include Library > Add .ZIP Library...** and select the downloaded file.

### Wiring
1. Connect the voltage sensors to pins `A0` and `A1`.
2. Connect the Gravity AC Current Sensor to pin `A2`.
3. Optionally, connect an external LED or RGB LED with a resistor to pin `9`.

### Uploading the Code
1. Open the provided Arduino script in the IDE.
2. Connect the Arduino to your computer.
3. Set the **baud rate** in the Serial Monitor to `115200`.
4. Upload the code.

---

## Usage

### Serial Output
The script prints the following to the Serial Monitor every second:
- Voltage readings (`l1` and `l2`) in volts.
- Current reading in amps.

Example output:

# Autorun Configuration
This program is using `systemd` to run on boot. The service has been called `electrical-logger.service` in my instance. The configuration is stored in example at `/etc/systemd/system/electrical-logger.service`.

The configuration can be set up as follows:
```
[Unit]
Description=Data Logger
After=network.target

[Service]
ExecStart=<path_to_nodejs> <path_to script>
WorkingDirectory=<code_folder>
Restart=always
User=<pi_username>

[Install]
WantedBy=multi-user.target
```

- To stop the service at any time, run `sudo systemctl stop electrical-logger.service`
- To start the service at any time, run `sudo systemctl start electrical-logger.service`
- To disable it, run `sudo systemctl disable electrical-logger.service`
- You can always check the status of the service by running `sudo systemctl status electrical-logger.service`
- You can also view the live logs of the service by running `sudo journalctl -u electrical-logger.service -f`

# Stop / Start on USB Activity
This system stops trying to write to the USB device if it's plugged out. Similarl to that, if a USB device is plugged in, it starts logging out the data to the file `readings.csv` again. To achieve this, a `udev` rule was used. The current setup used is described below:
- Create a `udev` rule file:
    ```c
    sudo nano /etc/udev/rules.d/99-usb-storage.rules
    ```
- Update the contents as what's described below:
    ```c
    # Rule to start the service when any USB storage device is mounted
    ACTION=="add", KERNEL=="sd*[0-9]", RUN+="/bin/systemctl start electrical-logger.service"

    # Rule to stop the service when any USB storage device is removed
    ACTION=="remove", KERNEL=="sd*[0-9]", RUN+="/bin/systemctl stop electrical-logger.service"
    ```
  - `ACTION=="add"` triggers when a USB storage device is added (e.g., a USB stick).
  - `ACTION=="remove"` triggers when a USB storage device is removed.
  - `KERNEL=="sd*[0-9]"` targets any storage device like sda1, sdb1, etc.
  - `RUN+="/bin/systemctl start electrical-logger.service"` runs the command to start the service when the USB is added.
  - `RUN+="/bin/systemctl stop electrical-logger.service"` runs the command to stop the service when the USB is removed.
- Make sure to reload the `udev` rules with any changes
    ```c
    sudo udevadm control --reload-rules
    ```
