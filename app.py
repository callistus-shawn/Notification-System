from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .rag.function import get_html
from .rag.function import get_notif
from .rag.function import inp
from fastapi.responses import HTMLResponse
from .rag.function import web

app=FastAPI()
app.mount("/static", StaticFiles(directory="Warehouse-PoC/static"), name="static")

app.add_api_route("/",get_html,response_class=HTMLResponse)
app.add_api_route("/load",get_notif,methods=["GET"])
app.add_api_route("/input",inp,methods=["POST"])
app.add_api_websocket_route("/ws",web)