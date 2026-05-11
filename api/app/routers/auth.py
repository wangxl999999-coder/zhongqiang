from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User, GoldTransaction
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils import (
    hash_password, 
    verify_password, 
    create_access_token, 
    generate_api_key, 
    generate_referral_code,
    get_gold_expire_date
)
from app.config import settings
from app.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名或邮箱已存在"
        )
    
    referrer = None
    if user_data.referral_code:
        referrer = db.query(User).filter(
            User.referral_code == user_data.referral_code
        ).first()
    
    password_hash = hash_password(user_data.password)
    referral_code = generate_referral_code()
    
    while db.query(User).filter(User.referral_code == referral_code).first():
        referral_code = generate_referral_code()
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        api_key=generate_api_key(),
        balance=10,
        referral_code=referral_code,
        referrer_id=referrer.id if referrer else None
    )
    
    db.add(new_user)
    db.flush()
    
    welcome_transaction = GoldTransaction(
        user_id=new_user.id,
        type="signup_bonus",
        amount=10,
        balance_after=10,
        description="注册赠送金币",
        expire_at=get_gold_expire_date()
    )
    db.add(welcome_transaction)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        data={"user_id": new_user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户已被禁用"
        )
    
    access_token = create_access_token(
        data={"user_id": user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_user)):
    access_token = create_access_token(
        data={"user_id": current_user.id},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user)
    )
