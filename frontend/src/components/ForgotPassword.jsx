import { useState } from "react";
import { Link } from "react-router-dom";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from '../api/axios'; // axios instance
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    api.post("/user/forgot-password", { email })
      .then((response) => {
        toast.success("Password reset link sent to your email");
      })
      .catch((error) => {
        if (error.response) {   
          const { message } = error.response.data;
          alert(`Request failed: ${message}`);
        } else {
          alert("Request failed: Network error");
        }
      })
      .finally(() => {
        setLoading(false);
        setSubmitted(true);
      });
    setLoading(false);
    setSubmitted(true);
  };

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

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>
              <CheckCircle size={40} color="white" />
            </div>
            <h1 style={styles.successTitle}>Check your email</h1>
            <p style={styles.successText}>
              We've sent a password reset link to{" "}
              <span style={styles.emailHighlight}>{email}</span>.
            </p>
            <AuthButton variant="secondary" onClick={() => setSubmitted(false)}>
              Send again
            </AuthButton>
          </div>
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Remember your password?
              <Link to="/login" style={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link to="/login" style={styles.backLink}>
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Mail size={28} color="white" />
          </div>
          <h1 style={styles.title}>Forgot password?</h1>
          <p style={styles.subtitle}>
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <AuthInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            error={error}
            label="Email"
          />

          <AuthButton type="submit" loading={loading} fullWidth>
            Send reset link
          </AuthButton>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Remember your password?
            <Link to="/login" style={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
