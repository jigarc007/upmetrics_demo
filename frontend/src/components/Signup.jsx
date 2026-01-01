import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Camera, ArrowRight, Sparkles, Check, Phone } from 'lucide-react';
import AuthInput from './ui/AuthInput';
import AuthButton from './ui/AuthButton';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must include uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };
  console.log('PROFILE IMAGE STATE:', profileImage);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
  const formDataObj = new FormData();
    formDataObj.append('name', formData.name);
    formDataObj.append('email', formData.email);
    formDataObj.append('phone', formData.phone);
    formDataObj.append('password', formData.password);
    // Only send file if user selected a new image
 if (profileImage) {
      formDataObj.append('profile', profileImage);
    }

    setLoading(true);
    const res=await api.post('/user/signup', formDataObj);
    if(res.status===201){
      // Signup successful, handle accordingly
      toast.success('Signup successful! Please log in.');
      navigate('/login');
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    console.log('Signup attempt:', { ...formData, profileImage });
  };

const handleImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB');
    return;
  }

  // ✅ store actual file for backend upload
  setProfileImage(file);
  
  // ✅ preview only (base64)
  const reader = new FileReader();
  reader.onloadend = () => {
    // setProfileImage(reader.result);
  };
  reader.readAsDataURL(file);
};


  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'One number', met: /\d/.test(formData.password) },
  ];

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--gradient-surface)',
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundOrbStyle = {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.4,
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem',
    background: 'var(--gradient-glass)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 'calc(var(--radius) * 2)',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid hsla(var(--border), 0.5)',
    position: 'relative',
    zIndex: 10,
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  };

  const logoIconStyle = {
    width: '48px',
    height: '48px',
    background: 'var(--gradient-primary)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontSize: '0.9375rem',
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const stepIndicatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
  };

  const stepDotStyle = (isActive, isCompleted) => ({
    width: isActive || isCompleted ? '2rem' : '0.5rem',
    height: '0.5rem',
    borderRadius: '9999px',
    background:
      isActive || isCompleted
        ? 'var(--gradient-primary)'
        : 'hsl(var(--border))',
    transition: 'all 0.3s ease',
  });

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  };

  const profileUploadStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: profileImage
      ? `url(${profileImage})`
      : 'hsl(var(--secondary))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '3px solid hsl(var(--border))',
    position: 'relative',
    overflow: 'hidden',
  };

  const avatarOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background: 'hsla(0, 0%, 0%, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  };

  const requirementsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    background: 'hsl(var(--secondary))',
    borderRadius: 'var(--radius)',
    marginTop: '-0.5rem',
  };

  const requirementItemStyle = (met) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: met
      ? 'hsl(142 76% 36%)'
      : 'hsl(var(--muted-foreground))',
  });

  const footerStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9375rem',
    color: 'hsl(var(--muted-foreground))',
  };

  const linkStyle = {
    color: 'hsl(var(--primary))',
    textDecoration: 'none',
    fontWeight: 600,
    marginLeft: '0.25rem',
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          ...backgroundOrbStyle,
          width: '500px',
          height: '500px',
          background: 'hsl(280 87% 65%)',
          top: '-150px',
          left: '-150px',
        }}
        className="animate-float"
      />
      <div
        style={{
          ...backgroundOrbStyle,
          width: '600px',
          height: '600px',
          background: 'hsl(var(--primary))',
          bottom: '-200px',
          right: '-200px',
        }}
        className="animate-float"
      />

      <div style={cardStyle} className="animate-slide-up">
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <Sparkles size={24} color="white" />
          </div>
        </div>

        <div style={stepIndicatorStyle}>
          <div style={stepDotStyle(step === 1, step > 1)} />
          <div style={stepDotStyle(step === 2, false)} />
        </div>

        <h1 style={titleStyle}>
          {step === 1 ? 'Create your account' : 'Set your password'}
        </h1>

        <form style={formStyle} onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div style={profileUploadStyle}>
                <label htmlFor="profile-upload">
                  <div
                    style={avatarStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.querySelector(
                        '.avatar-overlay'
                      ).style.opacity = '1')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.querySelector(
                        '.avatar-overlay'
                      ).style.opacity = '0')
                    }
                  >
                    {!profileImage && <Camera size={32} />}
                    <div className="avatar-overlay" style={avatarOverlayStyle}>
                      <Camera size={24} color="white" />
                    </div>
                  </div>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <AuthInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                icon={<User size={18} />}
                label="Full Name"
                error={errors.name}
              />

              <AuthInput
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                icon={<Mail size={18} />}
                label="Email"
                error={errors.email}
              />
                <AuthInput
                          label="Phone"
                          icon={<Phone size={18} />}
                          value={formData.phone}
                          onChange={(e) =>
                             setFormData({ ...formData, phone: e.target.value })
                          }
                        />
              

              <AuthButton type="button" onClick={handleNextStep}>
                Continue <ArrowRight size={18} />
              </AuthButton>
            </>
          ) : (
            <>
              <button
                type="button"
                style={backButtonStyle}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>

              <AuthInput
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                icon={<Lock size={18} />}
                label="Password"
                error={errors.password}
              />

              <div style={requirementsStyle}>
                {passwordRequirements.map((req, i) => (
                  <div key={i} style={requirementItemStyle(req.met)}>
                    <Check size={14} /> {req.text}
                  </div>
                ))}
              </div>

              <AuthInput
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                icon={<Lock size={18} />}
                label="Confirm Password"
                error={errors.confirmPassword}
              />

              <AuthButton type="submit" loading={loading}>
                Create Account <ArrowRight size={18} />
              </AuthButton>
            </>
          )}
        </form>

        <p style={footerStyle}>
          Already have an account?
          <Link to="/login" style={linkStyle}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
