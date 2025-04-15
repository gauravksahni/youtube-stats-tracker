from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChannelHistoryBase(BaseModel):
    subscriber_count: int
    video_count: int
    view_count: int
    timestamp: datetime

class ChannelHistory(ChannelHistoryBase):
    id: int
    channel_id: str
    
    class Config:
        orm_mode = True

class ChannelBase(BaseModel):
    channel_id: str

class ChannelCreate(ChannelBase):
    pass

class Channel(ChannelBase):
    id: int
    title: str
    description: str
    published_at: datetime
    subscriber_count: int
    video_count: int
    view_count: int
    last_updated: datetime
    
    class Config:
        orm_mode = True

class ChannelWithHistory(Channel):
    history: List[ChannelHistory] = []
