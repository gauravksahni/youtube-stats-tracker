import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaYoutube } from 'react-icons/fa';
import './AddChannel.css';

const AddChannel = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [channelId, setChannelId] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractChannelId = (url) => {
    try {
      // Handle different YouTube URL formats
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = new URLSearchParams(urlObj.search);
      
      // youtube.com/channel/CHANNEL_ID format
      if (pathname.startsWith('/channel/')) {
        return pathname.split('/channel/')[1];
      }
      
      // youtube.com/c/CHANNEL_NAME format - we can't easily get the channel ID
      if (pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
        return null;
      }
      
      // youtube.com/watch?v=VIDEO_ID format with channel in search params
      if (searchParams.has('channel')) {
        return searchParams.get('channel');
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setChannelUrl(url);
    
    // Try to extract channel ID from URL
    const extractedId = extractChannelId(url);
    if (extractedId) {
      setChannelId(extractedId);
      setError('');
    }
  };

  const handleIdChange = (e) => {
    setChannelId(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!channelId.trim()) {
      setError('Please enter a valid YouTube channel ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${apiBaseUrl}/channels/`, { channel_id: channelId.trim() });
      toast.success('Channel added successfully!');
      navigate(`/channels/${channelId.trim()}`);
    } catch (err) {
      console.error('Error adding channel:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to add channel. Please check the channel ID and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="add-channel-container">
      <div className="add-channel-card">
        <div className="add-channel-header">
          <FaYoutube className="youtube-icon" />
          <h1>Add YouTube Channel</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="add-channel-form">
          <div className="form-group">
            <label htmlFor="channel-url">YouTube Channel URL (optional):</label>
            <input
              type="text"
              id="channel-url"
              value={channelUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/channel/..."
              className="form-control"
            />
            <small className="form-text">
              Enter a YouTube channel URL to automatically extract the channel ID
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="channel-id">YouTube Channel ID:</label>
            <input
              type="text"
              id="channel-id"
              value={channelId}
              onChange={handleIdChange}
              placeholder="UCxxx..."
              className="form-control"
              required
            />
            <small className="form-text">
              Enter the YouTube channel ID (starts with UC...)
            </small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Channel'}
            </button>
          </div>
        </form>
        
        <div className="help-section">
          <h3>How to find a YouTube Channel ID:</h3>
          <ol>
            <li>Go to the YouTube channel page</li>
            <li>Look at the URL in your browser</li>
            <li>If the URL contains "/channel/", the ID comes right after that</li>
            <li>Or right-click on the channel page, select "View Page Source", and search for "channelId"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AddChannel;
