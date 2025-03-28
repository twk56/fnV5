import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';
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
  maxWidth: '500px',
  marginTop: theme.spacing(4),
}));

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching booking with Token:', token);
      if (!token) {
        throw new Error('กรุณาล็อกอินเพื่อดูรายละเอียดการจอง');
      }

      const response = await axios.get(`${API}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Booking Response:', response.data);

      const now = dayjs().tz('Asia/Bangkok');
      const endTime = dayjs(response.data.endTime).tz('Asia/Bangkok');
      console.log(
        `⏰ Checking booking ${id}: Current time = ${now.format('YYYY-MM-DD HH:mm:ss')}, endTime = ${endTime.format('YYYY-MM-DD HH:mm:ss')}, Expired = ${now.isAfter(endTime)}`
      );

      if (now.isAfter(endTime) || now.isSame(endTime)) {
        console.log(`Booking ${id} has reached or passed endTime, canceling...`);
        await cancelBooking();
      } else {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'ไม่สามารถดึงข้อมูลการจองได้');
    }
  };

  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Attempting to cancel booking:', id);
      if (!token) {
        throw new Error('กรุณาล็อกอินเพื่อยกเลิกการจอง');
      }

      await axios.delete(`${API}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Booking canceled successfully:', id);
      navigate('/');
    } catch (error) {
      console.error('Error canceling booking:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'ไม่สามารถยกเลิกการจองได้');
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!booking) return <Typography>กำลังโหลด...</Typography>;

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
          รายละเอียดการจอง
        </Typography>
        <Typography variant="body1">ห้อง: {booking.room}</Typography>
        <Typography variant="body1">ผู้จอง: {booking.user?.studentId || 'ไม่ระบุ'}</Typography>
        <Typography variant="body1">
          เริ่ม: {dayjs(booking.startTime).tz('Asia/Bangkok').format('DD MMMM YYYY HH:mm:ss')}
        </Typography>
        <Typography variant="body1">
          สิ้นสุด: {dayjs(booking.endTime).tz('Asia/Bangkok').format('DD MMMM YYYY HH:mm:ss')}
        </Typography>
      </StyledContainer>
    </Box>
  );
};

export default BookingDetails;