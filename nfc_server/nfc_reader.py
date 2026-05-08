from smartcard.System import readers
from smartcard.util import toHexString
import time

class NFCReader:
    def __init__(self, reader_index=0, poll_interval=0.2):
        self.reader_index = reader_index
        self.poll_interval = poll_interval
        self.reader = readers()[reader_index]
        self.last_uid = None
        self.subscribers = []  # list of callback functions
        print(f"Waiting for NFC cards on: {self.reader}")

    def get_card_uid(self):
        """Attempts to read the UID of a card on the reader."""
        try:
            conn = self.reader.createConnection()
            conn.connect()
            uid, sw1, sw2 = conn.transmit([0xFF, 0xCA, 0x00, 0x00, 0x00])
            return ''.join(f"{byte:02X}" for byte in uid)
        except:
            return None

    def subscribe(self, callback):
        """Add a callback function to be called when a new card is detected."""
        if callable(callback):
            self.subscribers.append(callback)

    def _notify_subscribers(self, uid):
        """Internal method to notify all subscribed functions."""
        for callback in self.subscribers:
            callback(uid)

    def start_polling(self):
        """Continuously polls for NFC cards."""
        while True:
            uid = self.get_card_uid()
            if uid != self.last_uid:
                if uid:
                    self._notify_subscribers(uid)  # trigger all callbacks
                self.last_uid = uid
            time.sleep(self.poll_interval)