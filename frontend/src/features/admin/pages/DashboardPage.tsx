import { useEffect, useState, useContext } from 'react';
import { adminService } from '../services/adminService';
import { AuthContext } from '../../auth/context/AuthContext';

export const DashboardPage = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) {
      adminService.getStats(token).then(setStats).catch(console.error);
    }
  }, [token]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>Users: {stats.usersCount}</div>
      <div>Items: {stats.itemsCount}</div>
      <div>Claims: {stats.claimsCount}</div>
    </div>
  );
};
