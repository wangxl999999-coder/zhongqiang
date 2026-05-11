from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
    
    @app.get("/")
    async def index():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
    
    @app.get("/{path:path}")
    async def catch_all(path: str):
        file_path = os.path.join(frontend_dir, f"{path}.html")
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "服务运行正常"}
