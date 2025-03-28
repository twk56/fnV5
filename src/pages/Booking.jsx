import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookRoom } from '../api';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
} from '@mui/material';
import { styled } from '@mui/system';
import { MenuItem } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
  maxWidth: '500px',
  marginTop: theme.spacing(4),
  minHeight: '450px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const minTime = dayjs().tz('Asia/Bangkok').set('hour', 0).set('minute', 0);
  const maxTime = dayjs().tz('Asia/Bangkok').set('hour', 23).set('minute', 59);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/admin/room-access`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const available = response.data.filter((r) => r.status === 'available');
        setAvailableRooms(available);
      } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลห้องได้:', error);
        setError('ไม่สามารถดึงข้อมูลห้องจากฐานข้อมูลได้');
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (roomId) {
        try {
          const response = await axios.get(`${API_API}/room-access/${roomId}`);
          setRoom(response.data.name);
        } catch (error) {
          setError('ไม่สามารถดึงข้อมูลห้องได้');
        }
      }
    };
    fetchRoomDetails();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!startTime || !endTime) {
      setError('กรุณาเลือกช่วงเวลา');
      return;
    }

    if (startTime.isAfter(endTime)) {
      setError('เวลาเริ่มต้นต้องก่อนเวลาเสร็จสิ้น');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }

    const bookingData = {
      room: room,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    console.log("Booking data being sent:", bookingData);

    try {
      const response = await bookRoom(bookingData);
      console.log("✅ Booking response:", response.data);
      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error("Booking error:", err.response?.data || err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
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
          จองห้อง
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            select
            label="เลือกห้อง (ที่ว่าง)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {availableRooms.length > 0 ? (
              availableRooms.map((r) => (
                <MenuItem key={r._id} value={r.name}>
                  {r.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>ไม่มีห้องว่าง</MenuItem>
            )}
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="เวลาเริ่มต้น"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              minTime={minTime}
              maxTime={maxTime}
              ampm={false}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="เวลาเสร็จสิ้น"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              minTime={startTime || minTime}
              maxTime={maxTime}
              ampm={false}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: 'bold', borderRadius: '30px' }}
          >
            ยืนยันการจอง
          </Button>
        </form>
      </StyledContainer>
    </Box>
  );
};

export default Booking;