import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const QRScannerPage = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
      navigate(`/qr/scan/${code}`);
    }
  };

  return (
    <div>
      <h1>Scan QR Code</h1>
      <form onSubmit={handleScan}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter unique QR code" />
        <button type="submit">Scan</button>
      </form>
    </div>
  );
};
