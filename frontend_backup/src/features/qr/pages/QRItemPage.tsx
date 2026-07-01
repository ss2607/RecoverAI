import React, { useState, useContext } from 'react';
import { qrService } from '../services/qrService';
import { AuthContext } from '../../auth/context/AuthContext';
import { useParams } from 'react-router-dom';

export const QRItemPage = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();
  const [qrLink, setQrLink] = useState('');

  const generateLink = async () => {
    if (token && id) {
      const { link } = await qrService.generateLink(token, id);
      setQrLink(window.location.origin + link);
    }
  };

  return (
    <div>
      <h1>Generate QR Code</h1>
      <button onClick={generateLink}>Generate QR</button>
      {qrLink && (
        <div>
          <p>QR Link: <a href={qrLink}>{qrLink}</a></p>
        </div>
      )}
    </div>
  );
};
