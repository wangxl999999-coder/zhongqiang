@echo off
echo BUG管理系统 - 启动PHP内置服务器
echo ======================================
echo.
echo 请确保已安装PHP并配置好环境变量
echo.
echo 服务器将在: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.
echo ======================================
echo.

php -S localhost:8000

if errorlevel 1 (
    echo.
    echo 错误：无法启动PHP服务器
    echo 请确认PHP已正确安装并添加到系统PATH环境变量中
    echo.
    pause
)
