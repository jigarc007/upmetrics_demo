import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    api.post("/user/login", { email, password })
      .then((response) => {
        console.log("Login successful:", response.data);
        const { token,user } = response.data;  
        localStorage.setItem("token", token); 
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/home";
      })
      .catch((error) => {
        if (error.response) {
          const { message } = error.response.data;
          alert(`Login failed: ${message}`);
        } else {
          alert("Login failed: Network error");
        }
      })
      .finally(() => {
        setLoading(false);
      });
    
    setLoading(false);
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "var(--gradient-surface)",
    position: "relative",
    overflow: "hidden",
  };

  const backgroundOrbStyle = {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    opacity: 0.4,
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "440px",
    padding: "2.5rem",
    background: "var(--gradient-glass)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "calc(var(--radius) * 2)",
    boxShadow: "var(--shadow-xl)",
    border: "1px solid hsla(var(--border), 0.5)",
    position: "relative",
    zIndex: 10,
  };

  const logoStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
  };

  const logoIconStyle = {
    width: "48px",
    height: "48px",
    background: "var(--gradient-primary)",
    borderRadius: "var(--radius)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow-glow)",
  };

  const titleStyle = {
    fontSize: "1.75rem",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "0.5rem",
  };

  const subtitleStyle = {
    fontSize: "0.95rem",
    textAlign: "center",
    marginBottom: "2rem",
    color: "hsl(var(--muted-foreground))",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  };

  const forgotPasswordStyle = {
    fontSize: "0.875rem",
    color: "hsl(var(--primary))",
    textAlign: "right",
    fontWeight: 500,
    cursor: "pointer",
  };

  const footerStyle = {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.95rem",
  };

  const linkStyle = {
    color: "hsl(var(--primary))",
    fontWeight: 600,
    marginLeft: "0.25rem",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      {/* Background Orbs */}
      <div
        style={{
          ...backgroundOrbStyle,
          width: 600,
          height: 600,
          background: "hsl(var(--primary))",
          top: -200,
          right: -200,
        }}
      />
      <div
        style={{
          ...backgroundOrbStyle,
          width: 400,
          height: 400,
          background: "hsl(280 87% 65%)",
          bottom: -100,
          left: -100,
        }}
      />

      <div style={cardStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <Sparkles size={24} color="white" />
          </div>
        </div>

        <h1 style={titleStyle}>Welcome back</h1>
        <p style={subtitleStyle}>Sign in to your account to continue</p>

        <form style={formStyle} onSubmit={handleSubmit}>
          <AuthInput
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            error={errors.email}
          />

          <div>
            <AuthInput
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              error={errors.password}
            />
            <a href="/forgot-password" style={forgotPasswordStyle}>
              Forgot password?
            </a>
          </div>

          <AuthButton type="submit" loading={loading}>
            Sign In <ArrowRight size={18} />
          </AuthButton>
        </form>

        <p style={footerStyle}>
          Don't have an account?
          <Link to="/signup" style={linkStyle}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
