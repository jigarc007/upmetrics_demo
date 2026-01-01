import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Check } from 'lucide-react';
import AuthInput from './ui/AuthInput';
import AuthButton from './ui/AuthButton';
import api from '../api/axios';

const Profile = () => {
  const userData=JSON.parse(localStorage.getItem("user")) || {};
  console.log('USER DATA FROM LOCAL STORAGE:', userData);
  const { name: initialName, email: initialEmail, phone: initialPhone, profile: initialProfile } = userData;
const [profile, setProfile] = useState({
  name: initialName || '',
  email: initialEmail || '',
  phone: initialPhone || '',
  profileImage: initialProfile || null, // preview or server URL
  profileFile: null, // actual File object
});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef(null);

const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  // ✅ store actual file for backend upload
  setProfile(prev => ({
    ...prev,
    profileFile: file,
  }));

  // ✅ preview only (base64)
  const reader = new FileReader();
  reader.onloadend = () => {
    setProfile(prev => ({
      ...prev,
      profileImage: reader.result,
    }));
  };
  reader.readAsDataURL(file);
};


  console.log('PROFILE STATE:', profile);
  const handleSave = async () => {
  try {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);

    // Only send file if user selected a new image
 if (profile.profileFile) {
      formData.append('profile', profile.profileFile);
    }

    const token = localStorage.getItem('token');

    const res = await api.put(
      '/user/update',
      formData,   
    );

    console.log('UPDATE RESPONSE DATA:', res.data);
    // ✅ Update localStorage with fresh user data
    localStorage.setItem('user', JSON.stringify(res.data.user));

    // // ✅ Update UI with backend response
    setProfile({
      name: res.data.user.name,
      email: res.data.user.email,
      phone: res.data.user.phone,
      profileImage: res.data.user.profile || null,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  } catch (err) {
    alert(err.message || 'Something went wrong');
  } finally {
    setIsLoading(false);
  }
};

  const containerStyle = {
    minHeight: '100vh',
    background: 'var(--gradient-dark)',
    padding: '2rem 1rem',
  };

  const contentStyle = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const backLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius)',
    background: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    textDecoration: 'none',
    border: '1px solid hsl(var(--border))',
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'hsl(var(--foreground))',
  };

  const cardStyle = {
    background: 'hsl(var(--card))',
    borderRadius: 'calc(var(--radius) * 2)',
    padding: '2rem',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid hsl(var(--border))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const avatarSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid hsl(var(--border))',
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: profile.profileImage
      ? `url(http://localhost:4000${profile.profileImage}) center/cover`
      : 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid hsl(var(--primary))',
    overflow: 'hidden',
  };

  const avatarPlaceholderStyle = {
    color: 'white',
    fontSize: '3rem',
    fontWeight: 700,
  };

  const uploadButtonStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'hsl(var(--primary))',
    border: '3px solid hsl(var(--card))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <Link to="/home" style={backLinkStyle}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={titleStyle}>Profile Settings</h1>
        </div>

        <div style={cardStyle}>
          {isSaved && (
            <div style={{ color: 'green', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <Check size={18} />
              Profile updated successfully!
            </div>
          )}

          <div style={avatarSectionStyle}>
            <div style={{ position: 'relative' }}>
              <div style={avatarStyle}>
                {profile.profileImage ? (
                  <img
                    src={
                      profile.profileImage?.startsWith('data:')
                        ? profile.profileImage
                        : `http://localhost:4000${profile.profileImage}`
                    }
                    alt="Profile" style={{ width: '100%', height: '100%' }} />
                ) : (
                  <div style={avatarPlaceholderStyle}></div>
                )}
              </div>
              <button
                type="button"
                style={uploadButtonStyle}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            <strong>{profile.name}</strong>
            <small>{profile.email}</small>
          </div>

          <AuthInput
            label="Name"
            icon={<User size={18} />}
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <AuthInput
            label="Email"
            icon={<Mail size={18} />}
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
         />

          <AuthInput
            label="Phone"
            icon={<Phone size={18} />}
            value={profile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />

          <AuthButton onClick={handleSave} loading={isLoading} fullWidth>
            <Save size={18} style={{ marginRight: '0.5rem' }} />
            Save Changes
          </AuthButton>
        </div>
      </div>
    </div>
  );
};

export default Profile;
