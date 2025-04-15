import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { FaYoutube, FaEye, FaVideo, FaUserFriends, FaTrash } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ChannelDetail.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChannelDetail = ({ apiBaseUrl }) => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartMetric, setChartMetric] = useState('subscriber_count');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchChannelDetails();
  }, [channelId]);

  const fetchChannelDetails = async () => {
    try {
      setLoading(true);
      // Fetch channel details
      const channelResponse = await axios.get(`${apiBaseUrl}/channels/${channelId}`);
      setChannel(channelResponse.data);

      // Fetch channel history
      const historyResponse = await axios.get(`${apiBaseUrl}/channels/${channelId}/history`);
      // Sort by timestamp ascending for the chart
      const sortedHistory = [...historyResponse.data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setHistory(sortedHistory);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching channel details:', err);
      setError('Failed to load channel details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/channels/${channelId}`);
      toast.success('Channel deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Error deleting channel:', err);
      toast.error('Failed to delete channel');
      setDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  const handleMetricChange = (e) => {
    setChartMetric(e.target.value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getChartData = () => {
    if (!history.length) return null;

    const labels = history.map(entry => 
      new Date(entry.timestamp).toLocaleDateString()
    );

    let label;
    let borderColor;
    let backgroundColor;

    switch (chartMetric) {
      case 'subscriber_count':
        label = 'Subscribers';
        borderColor = 'rgb(75, 192, 192)';
        backgroundColor = 'rgba(75, 192, 192, 0.2)';
        break;
      case 'view_count':
        label = 'Views';
        borderColor = 'rgb(255, 99, 132)';
        backgroundColor = 'rgba(255, 99, 132, 0.2)';
        break;
      case 'video_count':
        label = 'Videos';
        borderColor = 'rgb(255, 205, 86)';
        backgroundColor = 'rgba(255, 205, 86, 0.2)';
        break;
      default:
        label = 'Subscribers';
        borderColor = 'rgb(75, 192, 192)';
        backgroundColor = 'rgba(75, 192, 192, 0.2)';
    }

    return {
      labels,
      datasets: [
        {
          label,
          data: history.map(entry => entry[chartMetric]),
          borderColor,
          backgroundColor,
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${chartMetric === 'subscriber_count' ? 'Subscribers' : 
               chartMetric === 'view_count' ? 'Views' : 'Videos'} Over Time`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading channel details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!channel) {
    return <div className="error-message">Channel not found</div>;
  }

  return (
    <div className="channel-detail-container">
      <div className="channel-header">
        <div className="channel-title">
          <FaYoutube className="youtube-icon" />
          <h1>{channel.title}</h1>
        </div>
        <div className="channel-actions">
          {deleteConfirm ? (
            <div className="delete-confirmation">
              <span>Are you sure?</span>
              <button className="confirm-delete-btn" onClick={handleDeleteChannel}>
                Yes, Delete
              </button>
              <button className="cancel-delete-btn" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="delete-channel-btn" onClick={handleDeleteChannel}>
              <FaTrash /> Delete Channel
            </button>
          )}
        </div>
      </div>

      <div className="channel-description">
        <p>{channel.description}</p>
        <div className="channel-metadata">
          <span>Channel ID: {channel.channel_id}</span>
          <span>Created: {new Date(channel.published_at).toLocaleDateString()}</span>
          <span>Last Updated: {new Date(channel.last_updated).toLocaleString()}</span>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <FaUserFriends className="stat-icon subscribers" />
          <div className="stat-content">
            <h3>Subscribers</h3>
            <div className="stat-value">{formatNumber(channel.subscriber_count)}</div>
          </div>
        </div>
        <div className="stat-card">
          <FaVideo className="stat-icon videos" />
          <div className="stat-content">
            <h3>Videos</h3>
            <div className="stat-value">{formatNumber(channel.video_count)}</div>
          </div>
        </div>
        <div className="stat-card">
          <FaEye className="stat-icon views" />
          <div className="stat-content">
            <h3>Total Views</h3>
            <div className="stat-value">{formatNumber(channel.view_count)}</div>
          </div>
        </div>
      </div>

      <div className="history-section">
        <div className="history-header">
          <h2>Historical Data</h2>
          <div className="metric-selector">
            <label htmlFor="metric-select">Show metric:</label>
            <select id="metric-select" value={chartMetric} onChange={handleMetricChange}>
              <option value="subscriber_count">Subscribers</option>
              <option value="view_count">Views</option>
              <option value="video_count">Videos</option>
            </select>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="chart-container">
            <Line data={getChartData()} options={chartOptions} />
          </div>
        ) : (
          <div className="no-history">
            <p>No historical data available yet. Data will be collected over time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelDetail;
