import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ChannelDetail from './components/ChannelDetail';
import AddChannel from './components/AddChannel';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import env from './env'; // Import our environment configuration
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  // Use the API URL from our environment configuration
  const [apiBaseUrl] = useState(env.REACT_APP_API_URL);
  
  // Log the environment we're running in (for debugging)
  useEffect(() => {
    console.log(`Running in ${env.REACT_APP_ENV} environment`);
    console.log(`API URL: ${apiBaseUrl}`);
  }, [apiBaseUrl]);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard apiBaseUrl={apiBaseUrl} />} />
            <Route path="/channels/:channelId" element={<ChannelDetail apiBaseUrl={apiBaseUrl} />} />
            <Route path="/add-channel" element={<AddChannel apiBaseUrl={apiBaseUrl} />} />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;
