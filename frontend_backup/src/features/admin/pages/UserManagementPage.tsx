import React, { useEffect, useState, useContext } from 'react';
import { adminService } from '../services/adminService';
import { AuthContext } from '../../auth/context/AuthContext';

export const UserManagementPage = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      adminService.getUsers(token).then(setUsers).catch(console.error);
    }
  }, [token]);

  return (
    <div>
      <h1>User Management</h1>
      <ul>
        {users.map((u) => (
          <li key={u._id}>{u.name} - {u.email} - {u.role}</li>
        ))}
      </ul>
    </div>
  );
};
