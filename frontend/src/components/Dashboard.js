import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaYoutube, FaSort, FaEye, FaVideo, FaUserFriends } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ apiBaseUrl }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('subscriber_count');

  useEffect(() => {
    fetchChannels();
  }, [sortBy]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/channels/?sort_by=${sortBy}`);
      setChannels(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load YouTube channels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return <div className="loading">Loading YouTube statistics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>YouTube Channel Statistics</h1>
        <div className="controls">
          <div className="sort-control">
            <label htmlFor="sort-select">Sort by:</label>
            <select id="sort-select" value={sortBy} onChange={handleSortChange}>
              <option value="subscriber_count">Subscribers</option>
              <option value="view_count">Views</option>
              <option value="video_count">Videos</option>
            </select>
          </div>
          <Link to="/add-channel" className="add-channel-btn">
            Add Channel
          </Link>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="no-channels">
          <p>No YouTube channels added yet. Add a channel to start tracking.</p>
        </div>
      ) : (
        <div className="channels-grid">
          {channels.map((channel) => (
            <Link
              to={`/channels/${channel.channel_id}`}
              className="channel-card"
              key={channel.channel_id}
            >
              <div className="channel-header">
                <FaYoutube className="youtube-icon" />
                <h2>{channel.title}</h2>
              </div>
              <div className="channel-stats">
                <div className="stat">
                  <FaUserFriends className="stat-icon" />
                  <div className="stat-details">
                    <span className="stat-value">{formatNumber(channel.subscriber_count)}</span>
                    <span className="stat-label">Subscribers</span>
                  </div>
                </div>
                <div className="stat">
                  <FaVideo className="stat-icon" />
                  <div className="stat-details">
                    <span className="stat-value">{formatNumber(channel.video_count)}</span>
                    <span className="stat-label">Videos</span>
                  </div>
                </div>
                <div className="stat">
                  <FaEye className="stat-icon" />
                  <div className="stat-details">
                    <span className="stat-value">{formatNumber(channel.view_count)}</span>
                    <span className="stat-label">Views</span>
                  </div>
                </div>
              </div>
              <div className="last-updated">
                Last updated: {new Date(channel.last_updated).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
