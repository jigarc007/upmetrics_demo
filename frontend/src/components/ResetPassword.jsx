import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios'; // axios instance
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

    const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      background: "var(--gradient-surface)",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      background:
        "linear-gradient(145deg, hsla(0 0% 100% / 0.08), hsla(0 0% 100% / 0.02))",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "2.5rem",
      boxShadow:
        "0 25px 50px -12px hsla(0 0% 0% / 0.5), inset 0 1px 0 hsla(0 0% 100% / 0.1)",
      border: "1px solid hsla(0 0% 100% / 0.1)",
    },
    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "hsl(215 20% 65%)",
      fontSize: "0.875rem",
      textDecoration: "none",
      marginBottom: "1.5rem",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    iconWrapper: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, hsl(262 83% 58%), hsl(280 70% 50%))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1.5rem",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: "#000",
    },
    subtitle: {
      fontSize: "0.9375rem",
      color: "hsl(215 20% 65%)",
      lineHeight: 1.6,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    successContainer: {
      textAlign: "center",
    },
    successIcon: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, hsl(142 76% 36%), hsl(142 70% 45%))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1.5rem",
    },
    successTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#000",
    },
    successText: {
      fontSize: "0.9375rem",
      color: "hsl(215 20% 65%)",
      marginBottom: "2rem",
    },
    emailHighlight: {
      color: "hsl(262 83% 68%)",
      fontWeight: 600,
    },
    footer: {
      marginTop: "2rem",
      textAlign: "center",
      paddingTop: "1.5rem",
      borderTop: "1px solid hsla(0 0% 100% / 0.1)",
    },
    footerText: {
      fontSize: "0.875rem",
      color: "hsl(215 20% 65%)",
    },
    footerLink: {
      color: "hsl(262 83% 68%)",
      fontWeight: 600,
      textDecoration: "none",
      marginLeft: "0.25rem",
    },
  };
const ResetPassword = () => {
  const { token } = useParams();
  console.log('RESET TOKEN:', token);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      return setError('All fields are required');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);

      const res = await api.post(`/user/reset-password/${token}`, {
        password,
      });
      console.log({ res });
      setSuccess(true);
      // navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Reset token is invalid or expired'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <CheckCircle size={48} color="green" />
            <h2>Password Reset Successful</h2>
            <p>You can now login with your new password</p>
            <Link to="/login" style={styles.link}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link to="/login" style={styles.back}>
          <ArrowLeft size={16} /> Back to login
        </Link>

        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <AuthInput
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          <AuthInput
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={18} />}
            error={error}
          />

          <AuthButton type="submit" loading={loading} fullWidth>
            Reset Password
          </AuthButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
