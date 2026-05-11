import subprocess
import sys
import os

required_packages = [
    'fastapi',
    'uvicorn',
    'sqlalchemy',
    'pymysql',
    'cryptography',
    'python-jose',
    'passlib',
    'python-multipart',
    'pydantic',
    'pydantic-settings',
    'httpx',
    'beautifulsoup4',
    'lxml',
    'python-dotenv'
]

def install_packages():
    print("正在安装依赖包...")
    for package in required_packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])
            print(f"  ✓ {package} 安装成功")
        except Exception as e:
            print(f"  ✗ {package} 安装失败: {e}")

def create_database():
    print("\n正在检查数据库...")
    try:
        from sqlalchemy import create_engine, text
        from app.config import settings
        
        db_url = settings.DATABASE_URL
        base_url = db_url.rsplit('/', 1)[0]
        
        engine = create_engine(base_url)
        with engine.connect() as conn:
            result = conn.execute(text("SHOW DATABASES LIKE 'api_platform'"))
            if not result.fetchone():
                conn.execute(text("CREATE DATABASE api_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                conn.commit()
                print("  ✓ 数据库 api_platform 创建成功")
            else:
                print("  ✓ 数据库 api_platform 已存在")
        
        return True
    except Exception as e:
        print(f"  ✗ 数据库连接失败: {e}")
        print("\n请确保MySQL服务已启动，并检查 .env 文件中的数据库配置。")
        print(f"当前配置: {settings.DATABASE_URL}")
        return False

def create_tables():
    print("\n正在创建数据库表...")
    try:
        from app.database import Base, engine
        from app.models import User, GoldTransaction, APICall, ReferralReward
        
        Base.metadata.create_all(bind=engine)
        print("  ✓ 数据库表创建成功")
        return True
    except Exception as e:
        print(f"  ✗ 创建表失败: {e}")
        return False

def main():
    print("=" * 50)
    print("  API接口平台 - 初始化脚本")
    print("=" * 50)
    
    install_packages()
    
    if create_database():
        create_tables()
    
    print("\n" + "=" * 50)
    print("初始化完成！")
    print("=" * 50)
    print("\n启动服务命令:")
    print("  python run.py")
    print("\n访问地址:")
    print("  http://localhost:8000")
    print("\nAPI文档:")
    print("  http://localhost:8000/docs")
    print("=" * 50)

if __name__ == "__main__":
    main()
