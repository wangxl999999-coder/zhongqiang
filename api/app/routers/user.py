from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, GoldTransaction, APICall, ReferralReward
from app.schemas import (
    UserResponse, 
    GoldTransactionResponse, 
    APICallResponse,
    RechargeRequest,
    RechargeResponse,
    PromotionResponse,
    StatisticsResponse
)
from app.dependencies import get_current_user
from app.utils import get_gold_expire_date, calculate_referral_reward
from app.config import settings
from sqlalchemy import func

router = APIRouter(prefix="/api/user", tags=["用户中心"])

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/regenerate-api-key")
def regenerate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.utils import generate_api_key
    
    current_user.api_key = generate_api_key()
    db.commit()
    db.refresh(current_user)
    
    return {
        "success": True,
        "message": "API_KEY已重新生成",
        "api_key": current_user.api_key
    }

@router.get("/gold-transactions", response_model=List[GoldTransactionResponse])
def get_gold_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    transactions = db.query(GoldTransaction).filter(
        GoldTransaction.user_id == current_user.id
    ).order_by(
        GoldTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return transactions

@router.post("/recharge", response_model=RechargeResponse)
def recharge(
    recharge_data: RechargeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gold_amount = int(recharge_data.amount * 100)
    
    current_user.balance += gold_amount
    
    recharge_transaction = GoldTransaction(
        user_id=current_user.id,
        type="recharge",
        amount=gold_amount,
        balance_after=current_user.balance,
        description=f"充值 {recharge_data.amount} 元",
        reference_id=f"recharge_{current_user.id}_{int(current_user.id * 1000 + recharge_data.amount * 100)}",
        expire_at=get_gold_expire_date()
    )
    db.add(recharge_transaction)
    
    if current_user.referrer_id:
        referrer = db.query(User).filter(User.id == current_user.referrer_id).first()
        if referrer:
            reward_amount = calculate_referral_reward(recharge_data.amount)
            referrer.balance += reward_amount
            
            reward_transaction = GoldTransaction(
                user_id=referrer.id,
                type="referral_reward",
                amount=reward_amount,
                balance_after=referrer.balance,
                description=f"推广返利 - {current_user.username} 充值 {recharge_data.amount} 元",
                expire_at=get_gold_expire_date()
            )
            db.add(reward_transaction)
            
            referral_reward = ReferralReward(
                referrer_id=referrer.id,
                referred_id=current_user.id,
                recharge_amount=int(recharge_data.amount),
                reward_amount=reward_amount
            )
            db.add(referral_reward)
    
    db.commit()
    db.refresh(current_user)
    
    return RechargeResponse(
        success=True,
        message=f"充值成功！获得 {gold_amount} 金币",
        gold_added=gold_amount,
        new_balance=current_user.balance
    )

@router.get("/promotion", response_model=PromotionResponse)
def get_promotion_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    referral_link = f"{settings.FRONTEND_URL}/register?ref={current_user.referral_code}"
    
    referrals_count = db.query(User).filter(
        User.referrer_id == current_user.id
    ).count()
    
    total_earned = db.query(func.sum(GoldTransaction.amount)).filter(
        GoldTransaction.user_id == current_user.id,
        GoldTransaction.type == "referral_reward"
    ).scalar() or 0
    
    return PromotionResponse(
        referral_code=current_user.referral_code,
        referral_link=referral_link,
        referrals_count=referrals_count,
        total_earned=total_earned
    )

@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_purchases = db.query(func.count(GoldTransaction.id)).filter(
        GoldTransaction.user_id == current_user.id,
        GoldTransaction.type == "recharge"
    ).scalar() or 0
    
    total_gold_purchased = db.query(func.sum(GoldTransaction.amount)).filter(
        GoldTransaction.user_id == current_user.id,
        GoldTransaction.type == "recharge"
    ).scalar() or 0
    
    total_consumed = db.query(func.sum(GoldTransaction.amount)).filter(
        GoldTransaction.user_id == current_user.id,
        GoldTransaction.type == "api_usage",
        GoldTransaction.amount < 0
    ).scalar() or 0
    
    total_api_calls = db.query(func.count(APICall.id)).filter(
        APICall.user_id == current_user.id
    ).scalar() or 0
    
    return StatisticsResponse(
        total_purchases=total_purchases,
        total_gold_purchased=total_gold_purchased,
        total_consumed=abs(total_consumed),
        total_api_calls=total_api_calls
    )

@router.get("/purchase-list", response_model=List[GoldTransactionResponse])
def get_purchase_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    transactions = db.query(GoldTransaction).filter(
        GoldTransaction.user_id == current_user.id,
        GoldTransaction.type.in_(["recharge", "signup_bonus", "referral_reward"])
    ).order_by(
        GoldTransaction.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return transactions

@router.get("/consumption-list", response_model=List[APICallResponse])
def get_consumption_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    api_calls = db.query(APICall).filter(
        APICall.user_id == current_user.id
    ).order_by(
        APICall.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return api_calls
