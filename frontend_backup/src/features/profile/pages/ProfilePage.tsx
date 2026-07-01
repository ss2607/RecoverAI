import React, { useEffect, useState, useContext } from 'react';
import { profileService } from '../services/profileService';
import { AuthContext } from '../../auth/context/AuthContext';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (token) {
      profileService.getProfile(token).then(setProfile).catch(console.error);
    }
  }, [token]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <Link to="/profile/edit">Edit Profile</Link>
      <br />
      <Link to="/profile/change-password">Change Password</Link>
    </div>
  );
};
