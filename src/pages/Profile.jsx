import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api";
import { Container, Typography, Box, Paper } from "@mui/material";
import { styled } from "@mui/system";
import API from "../config";

const ProfileContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "2rem",
});

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    studentId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        navigate("/login");
        return;
      }

      try {
        const response = await getProfile();
        console.log("Profile data received:", response);
        setProfile({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          studentId: response.data.studentId || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์");
        navigate("/login");
      }
    };

    fetchProfile();
  }, []);

  return (
    <ProfileContainer maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ padding: 3, textAlign: "center", width: "100%" }}
      >
        <Typography variant="h4" gutterBottom>
          โปรไฟล์ของคุณ
        </Typography>

        <Box sx={{ marginTop: 3, textAlign: "left", width: "100%" }}>
          <Typography variant="h6">ชื่อ-นามสกุล: {profile.fullName}</Typography>
          <Typography variant="h6">อีเมล: {profile.email}</Typography>
          <Typography variant="h6">
            รหัสนักศึกษา: {profile.studentId}
          </Typography>
        </Box>
      </Paper>
    </ProfileContainer>
  );
};

export default Profile;
