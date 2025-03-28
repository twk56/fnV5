import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  Divider,
  Fade,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import API from '../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  fontSize: "1.1rem",
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  textTransform: "none",
  "&:hover": {
    transform: "translateY(-2px)",
    transition: "all 0.2s ease-in-out",
  },
}));

const Register = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!user.fullName || typeof user.fullName !== "string" || !user.fullName.trim()) 
      newErrors.fullName = "กรุณากรอกชื่อ-นามสกุล";
    if (!user.email || typeof user.email !== "string" || !user.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) 
      newErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    if (!user.studentId || typeof user.studentId !== "string" || !/^\d{12}-\d$/.test(user.studentId.trim()))
      newErrors.studentId = "รหัสนักศึกษาต้องเป็นตัวเลข 13 หลัก";
    if (!user.password || user.password.length < 6) 
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    if (user.password !== user.confirmPassword) 
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const payload = {
      fullName: user.fullName,
      email: user.email,
      studentId: user.studentId,
      password: user.password,
    };
    console.log("Sending to server:", payload);

    setStatus({ loading: true, success: false, error: "" });

    try {
      const response = await registerUser(payload);
      setStatus({ loading: false, success: true, error: "" });
      setUser({
        fullName: "",
        email: "",
        studentId: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการลงทะเบียน";
      console.log("Server error:", error.response?.data);
      setStatus({
        loading: false,
        success: false,
        error: errorMessage,
      });
    }
  };

  const handleChange = (field) => (e) => {
    setUser({ ...user, [field]: e.target.value || "" });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
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
      <Container maxWidth="sm">
        <Fade in={true} timeout={600}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{ fontWeight: 700, color: "primary.main", mb: 4 }}
            >
              สมัครสมาชิก
            </Typography>

            {status.success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                ลงทะเบียนสำเร็จ!
              </Alert>
            )}
            {status.error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                ❌ {status.error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleRegister}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="ชื่อ-นามสกุล"
                variant="outlined"
                fullWidth
                required
                value={user.fullName}
                onChange={handleChange("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <TextField
                label="อีเมล"
                type="email"
                variant="outlined"
                fullWidth
                required
                value={user.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <TextField
                label="รหัสนักศึกษา"
                variant="outlined"
                fullWidth
                required
                value={user.studentId}
                onChange={handleChange("studentId")}
                error={!!errors.studentId}
                helperText={errors.studentId}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <TextField
                label="รหัสผ่าน"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={user.password}
                onChange={handleChange("password")}
                error={!!errors.password}
                helperText={errors.password}
                disabled={status.loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 8 } }}
              />
              <TextField
                label="ยืนยันรหัสผ่าน"
                type="password"
                variant="outlined"
                fullWidth
                required
                value={user.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
                {status.loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </StyledButton>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary" align="center">
              มีบัญชีแล้ว?{" "}
              <Button
                onClick={handleLoginRedirect}
                color="primary"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": { textDecoration: "underline" },
                }}
                disabled={status.loading}
              >
                เข้าสู่ระบบ
              </Button>
            </Typography>
          </StyledPaper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;