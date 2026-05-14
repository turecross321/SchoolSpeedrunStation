import asyncio
import websockets
import threading
from nfc_server.nfc_reader import NFCReader

connected_clients = set()

async def register(websocket):
    connected_clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")

async def unregister(websocket):
    connected_clients.remove(websocket)
    print(f"Client disconnected: {websocket.remote_address}")

async def handler(websocket):
    await register(websocket)
    try:
        async for _ in websocket:
            pass
    finally:
        await unregister(websocket)

async def broadcast(uid):
    if connected_clients:
        message = str(uid)
        await asyncio.gather(
            *[client.send(message) for client in connected_clients],
            return_exceptions=True
        )

async def main(listen_ip: str = "127.0.0.1", port: str = "6769"):
    loop = asyncio.get_running_loop()

    # NFC callback (runs in another thread)
    def on_card_detected(uid):
        print("Card detected:", uid)
        asyncio.run_coroutine_threadsafe(broadcast(uid), loop)

    # Start NFC reader in separate thread
    reader = NFCReader()
    reader.subscribe(on_card_detected)
    threading.Thread(target=reader.start_polling, daemon=True).start()

    # Start WebSocket server (INSIDE running loop)
    server = await websockets.serve(handler, listen_ip, port)

    print("WebSocket server running on ws://" + listen_ip + ":" + port)

    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())