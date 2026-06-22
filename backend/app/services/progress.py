import asyncio

from fastapi import WebSocket, WebSocketDisconnect

_TERMINAL_EVENTS = {"result", "error"}


class ProgressHub:

    def __init__(self) -> None:
        self._queues: dict[str, asyncio.Queue] = {}

    def subscribe(self, job_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._queues[job_id] = queue
        return queue

    def unsubscribe(self, job_id: str, queue: asyncio.Queue) -> None:
        if self._queues.get(job_id) is queue:
            del self._queues[job_id]

    def publish(self, job_id: str, event: dict) -> None:
        queue = self._queues.get(job_id)
        if queue is not None:
            queue.put_nowait(event)


hub = ProgressHub()


async def stream_job_events(websocket: WebSocket, job_id: str) -> None:
    await websocket.accept()
    queue = hub.subscribe(job_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event)
            if event["type"] in _TERMINAL_EVENTS:
                break
        await websocket.close()
    except WebSocketDisconnect:
        pass
    finally:
        hub.unsubscribe(job_id, queue)
