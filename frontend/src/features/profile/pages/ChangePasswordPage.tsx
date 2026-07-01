import React, { useState, useContext } from 'react';
import { profileService } from '../services/profileService';
import { AuthContext } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      await profileService.changePassword(token, oldPassword, newPassword);
      navigate('/profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Change Password</h1>
      <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old Password" />
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
      <button type="submit">Update Password</button>
    </form>
  );
};
