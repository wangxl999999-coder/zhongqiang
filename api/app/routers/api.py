from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, GoldTransaction, APICall
from app.dependencies import get_user_by_api_key
from app.scraper import scraper
from datetime import datetime

router = APIRouter(prefix="/api/v1", tags=["数据接口"])

async def charge_api_usage(user: User, db: Session, endpoint: str, params: str = ""):
    if user.balance < 1:
        raise HTTPException(
            status_code=402,
            detail="金币不足，请充值后再试"
        )
    
    user.balance -= 1
    
    usage_transaction = GoldTransaction(
        user_id=user.id,
        type="api_usage",
        amount=-1,
        balance_after=user.balance,
        description=f"API调用: {endpoint}"
    )
    db.add(usage_transaction)
    
    api_call = APICall(
        user_id=user.id,
        endpoint=endpoint,
        params=params,
        cost=1,
        response_status=200
    )
    db.add(api_call)
    db.commit()
    db.refresh(user)

@router.get("/taobao/detail")
async def get_taobao_detail(
    url: str = Query(..., description="淘宝商品详情页URL"),
    user: User = Depends(get_user_by_api_key),
    db: Session = Depends(get_db)
):
    await charge_api_usage(user, db, "/api/v1/taobao/detail", f"url={url}")
    
    try:
        result = await scraper.scrape(url)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"采集失败: {str(e)}"
        )

@router.get("/tmall/detail")
async def get_tmall_detail(
    url: str = Query(..., description="天猫商品详情页URL"),
    user: User = Depends(get_user_by_api_key),
    db: Session = Depends(get_db)
):
    await charge_api_usage(user, db, "/api/v1/tmall/detail", f"url={url}")
    
    try:
        result = await scraper.scrape(url)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"采集失败: {str(e)}"
        )

@router.get("/test")
def test_api(
    user: User = Depends(get_user_by_api_key),
    db: Session = Depends(get_db)
):
    await charge_api_usage(user, db, "/api/v1/test", "")
    
    return {
        "success": True,
        "message": "API测试成功",
        "data": {
            "user": user.username,
            "remaining_balance": user.balance,
            "timestamp": datetime.utcnow().isoformat()
        }
    }

@router.get("/ping")
def ping():
    return {
        "success": True,
        "message": "服务正常",
        "timestamp": datetime.utcnow().isoformat()
    }
