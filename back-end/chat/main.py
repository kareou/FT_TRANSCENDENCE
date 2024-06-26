from fastapi import WebSocket, FastAPI

app = FastAPI()

# Example WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Received message: {data}")
    except WebSocketDisconnect:
        pass

