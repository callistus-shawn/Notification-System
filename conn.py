from typing import List
from fastapi import WebSocket
class ConnectionManager:
        def __init__(self):
            self.conn_list: List[WebSocket]=[]

        async def connect(self, websocket: WebSocket):
            await websocket.accept()
            self.conn_list.append(websocket)

        async def disconnect(self,websocket: WebSocket):
            await self.conn_list.remove(websocket)

        async def send_json(self, message: dict):
            # count=0
            for web in self.conn_list:
                # if(count==message["id"]):
                    await web.send_json(message)
                # count+=1

manager=ConnectionManager()