import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  Paper,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "400px",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: "1rem",
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  textTransform: "none",
  "&:hover": {
    transform: "translateY(-2px)",
    transition: "all 0.2s ease-in-out",
  },
}));

const Login = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId || typeof formData.studentId !== "string" || !formData.studentId.trim()) 
      newErrors.studentId = "กรุณากรอกรหัสนักศึกษา";
    if (!formData.password || formData.password.length < 6) 
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value || "" });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    const payload = {
      studentId: formData.studentId,
      password: formData.password,
    };
    console.log("Sending to server:", payload);
  
    setStatus({ loading: true, error: "" });
  
    try {
      const response = await loginUser(payload);
      const { token, role } = response; // ดึง token และ role จาก response
      localStorage.setItem('token', token); // บันทึก token
      console.log('Login success, token:', token, 'role:', role);
      setStatus({ loading: false, error: "" });
      navigate("/");
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง";
      console.log("Server error:", error.response?.data || error);
      setStatus({
        loading: false,
        error: errorMessage,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to right, #1c92d2, #f2fcfe)",
      }}
    >
      <Container maxWidth="xs">
        <Fade in={true} timeout={600}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h5"
              component="h1"
              align="center"
              sx={{ fontWeight: 700, color: "primary.main", mb: 4 }}
            >
              เข้าสู่ระบบ
            </Typography>

            {status.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                ❌ {status.error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleLogin}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                fullWidth
                required
                label="รหัสนักศึกษา"
                variant="outlined"
                value={formData.studentId}
                onChange={handleChange("studentId")}
                error={!!errors.studentId}
                helperText={errors.studentId}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <TextField
                fullWidth
                required
                type="password"
                label="รหัสผ่าน"
                variant="outlined"
                value={formData.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <StyledButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={status.loading}
                startIcon={status.loading && <CircularProgress size={20} />}
              >
                {status.loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </StyledButton>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/register"
                sx={{
                  fontWeight: "bold",
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                สมัครสมาชิก
              </Link>
            </Typography>
          </StyledPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;