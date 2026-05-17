#!/bin/bash

cat <<EOF | sudo tee /etc/modprobe.d/blacklist-nfc.conf
blacklist pn533
blacklist pn533_usb
blacklist nfc
EOF

sudo modprobe -r pn533_usb pn533 nfc

sudo apt update
sudo apt -y install build-essential python3.12-dev git python3.12-venv swig pcscd libpcsclite-dev chromium-browser pulseaudio-utils curl usbutils

sudo systemctl enable pcscd.socket
sudo systemctl start pcscd.socket

sudo git clone https://github.com/turecross321/SchoolSpeedrunStation.git /opt/SchoolSpeedrunStation

sudo python3 -m venv /opt/SchoolSpeedrunStation/venv
sudo /opt/SchoolSpeedrunStation/venv/bin/pip install -r /opt/SchoolSpeedrunStation/requirements.txt

cat <<'EOF' | sudo tee /opt/SchoolSpeedrunStation/start.sh
#!/bin/bash
cd /opt/SchoolSpeedrunStation
git pull
/opt/SchoolSpeedrunStation/venv/bin/python3 main.py
EOF

sudo chmod +x /opt/SchoolSpeedrunStation/start.sh

cat <<EOF | sudo tee /etc/systemd/system/acr122u-init.service
[Unit]
Description=Delayed ACR122U initialization
After=pcscd.service

[Service]
Type=oneshot
ExecStart=/bin/sleep 45
ExecStart=/bin/systemctl restart pcscd.service
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

cat <<EOF | sudo tee /etc/systemd/system/speedrun_station.service
[Unit]
Description=SchoolSpeedrunStation Backend Service
After=network.target acr122u-init.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/SchoolSpeedrunStation
ExecStart=/opt/SchoolSpeedrunStation/start.sh
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable acr122u-init.service
sudo systemctl enable speedrun_station.service
sudo systemctl start acr122u-init.service
sudo systemctl start speedrun_station.service

cat <<EOF | sudo tee /etc/udev/rules.d/99-acr122u.rules
ACTION=="add", SUBSYSTEM=="usb", ATTRS{idVendor}=="072f", ATTRS{idProduct}=="2200", RUN+="/bin/systemctl restart speedrun_station.service"
EOF

sudo udevadm control --reload-rules

mkdir -p ~/.config/autostart
cat <<'EOF' > ~/.config/autostart/chromium_kiosk.desktop
[Desktop Entry]
Type=Application
Name=Chromium Kiosk
Exec=bash -c "pactl set-sink-volume @DEFAULT_SINK@ 100%; pactl set-sink-mute @DEFAULT_SINK@ 0; until curl -sf http://localhost:6768 > /dev/null; do sleep 1; done; chromium-browser --kiosk --incognito --autoplay-policy=no-user-gesture-required --check-for-update-interval=31536000 http://localhost:6768"
X-GNOME-Autostart-enabled=true
EOF

echo "Setup complete. Please reboot to ensure all services and kiosk mode start correctly."
