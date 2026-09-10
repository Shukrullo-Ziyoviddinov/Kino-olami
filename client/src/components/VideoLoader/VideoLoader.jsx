import React from 'react';
import './VideoLoader.css';

const VideoLoader = ({ message = 'Video yuklanmoqda...' }) => {
  return (
    <div className="video-loader" role="status" aria-live="polite">
      <div className="video-loader__spinner" aria-hidden="true" />
      <span className="video-loader__text">{message}</span>
    </div>
  );
};

export default VideoLoader;
