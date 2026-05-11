from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    api_key = Column(String(64), unique=True, index=True)
    balance = Column(Integer, default=10)
    referral_code = Column(String(20), unique=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    referrer = relationship("User", remote_side=[id], backref="referrals")
    gold_transactions = relationship("GoldTransaction", back_populates="user")
    api_calls = relationship("APICall", back_populates="user")

class GoldTransaction(Base):
    __tablename__ = "gold_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    description = Column(String(255))
    reference_id = Column(String(100))
    expire_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="gold_transactions")

class APICall(Base):
    __tablename__ = "api_calls"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint = Column(String(100), nullable=False)
    params = Column(Text)
    response_status = Column(Integer)
    cost = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="api_calls")

class ReferralReward(Base):
    __tablename__ = "referral_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recharge_amount = Column(Integer, nullable=False)
    reward_amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
