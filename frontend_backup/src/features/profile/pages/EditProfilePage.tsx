import React, { useState, useContext, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { AuthContext } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const EditProfilePage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    if (token) {
      profileService.getProfile(token).then((p) => setName(p.name)).catch(console.error);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      await profileService.updateProfile(token, { name });
      navigate('/profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit Profile</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <button type="submit">Save</button>
    </form>
  );
};
