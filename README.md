## Autorun Configuration
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

## Stop / Start on USB Activity
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
