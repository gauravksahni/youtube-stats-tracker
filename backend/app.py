# app.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import googleapiclient.discovery
from apscheduler.schedulers.background import BackgroundScheduler
import logging
from datetime import datetime

from database import SessionLocal, engine
import models
import schemas

# Initialize models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="YouTube Statistics API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize YouTube API client
def get_youtube_client():
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YouTube API key not found. Set YOUTUBE_API_KEY environment variable.")
    
    return googleapiclient.discovery.build("youtube", "v3", developerKey=api_key)

# Function to fetch channel statistics
def fetch_channel_stats(channel_id: str, youtube=None):
    if youtube is None:
        youtube = get_youtube_client()
    
    request = youtube.channels().list(
        part="snippet,contentDetails,statistics",
        id=channel_id
    )
    response = request.execute()
    
    if not response["items"]:
        return None
    
    channel_data = response["items"][0]
    stats = channel_data["statistics"]
    
    return {
        "channel_id": channel_id,
        "title": channel_data["snippet"]["title"],
        "description": channel_data["snippet"]["description"],
        "published_at": channel_data["snippet"]["publishedAt"],
        "subscriber_count": int(stats.get("subscriberCount", 0)),
        "video_count": int(stats.get("videoCount", 0)),
        "view_count": int(stats.get("viewCount", 0)),
        "last_updated": datetime.now()
    }

# Function to update all channels in the database
def update_all_channels():
    logging.info(f"Starting scheduled update of YouTube channels at {datetime.now()}")
    try:
        db = SessionLocal()
        youtube = get_youtube_client()
        channels = db.query(models.Channel).all()
        
        for channel in channels:
            stats = fetch_channel_stats(channel.channel_id, youtube)
            if stats:
                # Update the existing channel
                for key, value in stats.items():
                    setattr(channel, key, value)
        
        # Add historical snapshot
        for channel in channels:
            snapshot = models.ChannelHistory(
                channel_id=channel.channel_id,
                subscriber_count=channel.subscriber_count,
                video_count=channel.video_count,
                view_count=channel.view_count,
                timestamp=datetime.now()
            )
            db.add(snapshot)
        
        db.commit()
        logging.info(f"Successfully updated {len(channels)} channels")
    except Exception as e:
        logging.error(f"Error updating channels: {str(e)}")
    finally:
        db.close()

# Set up background scheduler for periodic updates
scheduler = BackgroundScheduler()
scheduler.add_job(update_all_channels, 'interval', hours=6)  # Update every 6 hours
scheduler.start()

# API Endpoints
@app.get("/channels/", response_model=List[schemas.Channel])
def get_channels(
    skip: int = 0, 
    limit: int = 100,
    sort_by: Optional[str] = Query("subscriber_count", enum=["subscriber_count", "video_count", "view_count"]),
    db: Session = Depends(get_db)
):
    if sort_by == "subscriber_count":
        channels = db.query(models.Channel).order_by(models.Channel.subscriber_count.desc()).offset(skip).limit(limit).all()
    elif sort_by == "video_count":
        channels = db.query(models.Channel).order_by(models.Channel.video_count.desc()).offset(skip).limit(limit).all()
    elif sort_by == "view_count":
        channels = db.query(models.Channel).order_by(models.Channel.view_count.desc()).offset(skip).limit(limit).all()
    else:
        channels = db.query(models.Channel).offset(skip).limit(limit).all()
    
    return channels

@app.get("/channels/{channel_id}", response_model=schemas.Channel)
def get_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(models.Channel).filter(models.Channel.channel_id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@app.post("/channels/", response_model=schemas.Channel)
def add_channel(channel: schemas.ChannelCreate, db: Session = Depends(get_db)):
    # Check if channel already exists
    db_channel = db.query(models.Channel).filter(models.Channel.channel_id == channel.channel_id).first()
    if db_channel:
        raise HTTPException(status_code=400, detail="Channel already tracked")
    
    # Fetch latest channel data
    stats = fetch_channel_stats(channel.channel_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Channel not found on YouTube")
    
    # Create new channel in DB
    db_channel = models.Channel(**stats)
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    
    # Add initial history record
    history = models.ChannelHistory(
        channel_id=db_channel.channel_id,
        subscriber_count=db_channel.subscriber_count,
        video_count=db_channel.video_count,
        view_count=db_channel.view_count,
        timestamp=datetime.now()
    )
    db.add(history)
    db.commit()
    
    return db_channel

@app.get("/channels/{channel_id}/history", response_model=List[schemas.ChannelHistory])
def get_channel_history(
    channel_id: str, 
    limit: int = 30,
    db: Session = Depends(get_db)
):
    channel = db.query(models.Channel).filter(models.Channel.channel_id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    history = db.query(models.ChannelHistory)\
        .filter(models.ChannelHistory.channel_id == channel_id)\
        .order_by(models.ChannelHistory.timestamp.desc())\
        .limit(limit)\
        .all()
    
    return history

@app.delete("/channels/{channel_id}")
def delete_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(models.Channel).filter(models.Channel.channel_id == channel_id).first()
    if channel is None:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Delete history first (due to foreign key constraints)
    db.query(models.ChannelHistory).filter(models.ChannelHistory.channel_id == channel_id).delete()
    
    # Delete the channel
    db.delete(channel)
    db.commit()
    
    return {"detail": "Channel deleted successfully"}

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
