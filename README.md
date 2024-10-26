## Autorun Configuration
This program is using `systemd` to run on boot. The service has been called `electrical-logger.service`. The configuration is stored at `/etc/systemd/system/electrical-logger.service`.
- To stop the service at any time, run `sudo systemctl stop electrical-logger.service`
- To start the service at any time, run `sudo systemctl start electrical-logger.service`
- To disable it, run `sudo systemctl disable electrical-logger.service`
- You can always check the status of the service by running `sudo systemctl status electrical-logger.service`
- You can also view the live logs of the service by running `sudo journalctl -u electrical-logger.service -f`
