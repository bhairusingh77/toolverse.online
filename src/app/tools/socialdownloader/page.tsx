'use client';

import React, { useState } from 'react';

const SocialMediaConverter = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('high');
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [error, setError] = useState('');

  const supportedPlatforms = ['YouTube', 'Instagram', 'Twitter', 'Facebook', 'TikTok'];

  const qualityOptions = {
    mp4: [
      { value: 'highest', label: '1080p (Best Quality)' },
      { value: 'high', label: '720p (HD)' },
      { value: 'medium', label: '480p (SD)' },
      { value: 'low', label: '360p (Low)' }
    ],
    mp3: [
      { value: 'highest', label: '320kbps (Best Quality)' },
      { value: 'high', label: '256kbps (High)' },
      { value: 'medium', label: '192kbps (Medium)' },
      { value: 'low', label: '128kbps (Low)' }
    ]
  };

  const handleDownload = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setDownloadLink('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        body: JSON.stringify({ url, format, quality }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setDownloadLink(data.file);
      }
    } catch {
      setError('Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Social Media Downloader
          </h1>

          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="text"
                placeholder="Paste your video URL here..."
                className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Format Selection */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="mp3">MP3 Audio</option>
                </select>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className=" text-black w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {qualityOptions[format].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Download'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Download Link */}
            {downloadLink && (
              <a
                href={downloadLink}
                download
                className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-center transition"
              >
                Download File
              </a>
            )}

            {/* Supported Platforms */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 text-center">
                Supported platforms: {supportedPlatforms.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaConverter;