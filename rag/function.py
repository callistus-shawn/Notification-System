from fastapi import WebSocket,WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
import json
import sqlite3

from ..model import Input
from ..conn import manager



conn=sqlite3.connect('Warehouse-PoC/database/notif.db')
c=conn.cursor()

async def get_html():
    with open("warehouse-poc/templates/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

async def get_notif():
    print("on")
    c.execute("SELECT * FROM NOTIFICATIONS")
    notifications = c.fetchall()
    conn.commit()
    print(notifications)
    return JSONResponse(content={"notifications": notifications})


async def web(websocket: WebSocket):
    await manager.connect(websocket)            
    try:
        while True:
            data=await websocket.receive_text()
            d=json.loads(data)
            c.execute("""UPDATE NOTIFICATIONS SET action=? WHERE notifications=?""",(d['type'],d['message']))
            conn.commit()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
        
async def inp(item:Input):
    c.execute("INSERT INTO notifications VALUES(?,?)",(item.input,"-"))
    c.execute("SELECT * FROM notifications")
    print(c.fetchall())
    conn.commit()
    await manager.send_json({"inp": item.input})