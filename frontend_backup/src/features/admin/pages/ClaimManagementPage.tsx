import React, { useEffect, useState, useContext } from 'react';
import { adminService } from '../services/adminService';
import { AuthContext } from '../../auth/context/AuthContext';

export const ClaimManagementPage = () => {
  const { token } = useContext(AuthContext);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      adminService.getClaims(token).then(setClaims).catch(console.error);
    }
  }, [token]);

  return (
    <div>
      <h1>Claim Management</h1>
      <ul>
        {claims.map((c) => (
          <li key={c._id}>{c.status} - {c.item?.name}</li>
        ))}
      </ul>
    </div>
  );
};
