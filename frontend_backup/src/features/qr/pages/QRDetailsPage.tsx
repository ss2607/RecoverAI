import React, { useEffect, useState } from 'react';
import { qrService } from '../services/qrService';
import { useParams, Link } from 'react-router-dom';

export const QRDetailsPage = () => {
  const { code } = useParams<{ code: string }>();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      qrService.scanCode(code)
        .then(setItem)
        .catch((err) => setError(err.response?.data?.message || 'Error scanning code'));
    }
  }, [code]);

  if (error) return <div>{error}</div>;
  if (!item) return <div>Loading...</div>;

  return (
    <div>
      <h1>Item Details</h1>
      <p>Name: {item.name}</p>
      <p>Description: {item.description}</p>
      <Link to={`/claims/create/${item._id}`}>Claim this Item</Link>
    </div>
  );
};
