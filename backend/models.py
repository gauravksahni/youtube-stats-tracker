from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(String)
    published_at = Column(DateTime)
    subscriber_count = Column(BigInteger, default=0)
    video_count = Column(Integer, default=0)
    view_count = Column(BigInteger, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    history = relationship("ChannelHistory", back_populates="channel", cascade="all, delete-orphan")

class ChannelHistory(Base):
    __tablename__ = "channel_history"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String, ForeignKey("channels.channel_id", ondelete="CASCADE"))
    subscriber_count = Column(BigInteger)
    video_count = Column(Integer)
    view_count = Column(BigInteger)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    channel = relationship("Channel", back_populates="history")
