from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    api_key: Optional[str]
    balance: int
    referral_code: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None

class GoldTransactionResponse(BaseModel):
    id: int
    type: str
    amount: int
    balance_after: int
    description: Optional[str]
    expire_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class APICallResponse(BaseModel):
    id: int
    endpoint: str
    cost: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RechargeRequest(BaseModel):
    amount: float = Field(..., gt=0, description="充值金额（元）")

class RechargeResponse(BaseModel):
    success: bool
    message: str
    gold_added: int
    new_balance: int

class PromotionResponse(BaseModel):
    referral_code: str
    referral_link: str
    referrals_count: int
    total_earned: int

class StatisticsResponse(BaseModel):
    total_purchases: int
    total_gold_purchased: int
    total_consumed: int
    total_api_calls: int

class TaobaoDetailResponse(BaseModel):
    title: str
    price: str
    original_price: Optional[str]
    sku: list
    images: list
    detail_images: list
    success: bool
    message: str
