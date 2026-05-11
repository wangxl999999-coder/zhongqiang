from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os

from app.database import Base, engine
from app.routers import auth, user, api
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API接口平台",
    description="专业的API接口服务平台，支持用户注册登录、金币系统、推广返利、淘宝/天猫数据采集等功能",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(api.router)

frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "服务运行正常"}

@app.get("/")
async def index():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path == "health":
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    
    file_path = os.path.join(frontend_dir, full_path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    html_path = os.path.join(frontend_dir, f"{full_path}.html")
    if os.path.exists(html_path) and os.path.isfile(html_path):
        return FileResponse(html_path)
    
    return FileResponse(os.path.join(frontend_dir, "index.html"))
