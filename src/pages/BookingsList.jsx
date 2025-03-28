import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelBooking } from '../api';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Container,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import API from '../config';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('th');
dayjs.tz.setDefault('Asia/Bangkok');

const StyledContainer = styled(Container)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  maxWidth: '800px',
  marginTop: theme.spacing(4),
  minHeight: '450px',
  display: 'flex',
  flexDirection: 'column',
}));

const BookingsList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('กรุณาเข้าสู่ระบบก่อน');
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลการจองได้:', error);
        setError('ไม่สามารถดึงข้อมูลการจองได้');
      }
    };
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await cancelBooking(bookingId);
      console.log("✅ Cancel response:", response.data);
      setMessage(response.data.message);
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิก');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <StyledContainer>
        <Typography variant="h4" align="center" gutterBottom>
          รายการการจอง
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <List>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <ListItem
                key={booking._id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${booking.room} - ${dayjs(booking.startTime).format('DD/MM/YYYY HH:mm')} ถึง ${dayjs(booking.endTime).format('HH:mm')}`}
                  secondary={`ผู้จอง: ${booking.user?.studentId || 'ไม่ระบุ'}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography align="center">ไม่มีรายการการจอง</Typography>
          )}
        </List>
      </StyledContainer>
    </Box>
  );
};

export default BookingsList;