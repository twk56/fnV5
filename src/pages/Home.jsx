import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  CardMedia,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';
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

const RoomCard = styled(Card)(({ theme, status }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: '12px',
  border: `1px solid ${
    status === 'available' ? theme.palette.success.main : theme.palette.error.main
  }`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: status === 'available' ? '#e8f5e9' : '#ffebee',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFFFFFFF',
  color: '#000',
  textAlign: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const [role, setRole] = useState('guest');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching data with Token:', token);

      if (!token) {
        console.warn('Token ไม่มีหรือรูปแบบไม่ถูกต้อง');
        setRole('guest');
        try {
          const roomsResponse = await axios.get(`${API}/room-access`);
          console.log('Rooms Response for guest:', roomsResponse.data);
          setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : []);
        } catch (err) {
          console.error('Error fetching rooms for guest:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลห้อง');
        } finally {
          setLoading(false);
        }
        return;
      }

      const profileResponse = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile Response:', profileResponse.data);
      setRole(profileResponse.data.role || 'guest');
      setUserId(profileResponse.data._id);

      const roomsResponse = await axios.get(`${API}/room-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Rooms Response:', roomsResponse.data);
      setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : []);

      const bookingsResponse = await axios.get(`${API}/room-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Bookings Response:', bookingsResponse.data);
      setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
    } catch (error) {
      console.error('Main fetch error:', error.response?.data || error.message);
      setError(
        error.response?.status === 429
          ? 'เรียก API มากเกินไป กรุณารอสักครู่แล้วลองใหม่'
          : error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (roomId, status) => {
    try {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === roomId ? { ...room, status } : room
        )
      );
      const response = await axios.patch(
        `${API}/room-access/${roomId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === roomId ? { ...room, status: response.data.status } : room
        )
      );
    } catch (error) {
      console.error('ไม่สามารถอัพเดตสถานะห้องได้:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'ไม่สามารถอัพเดตสถานะห้องได้');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== bookingId)
        );
        alert('ยกเลิกการจองสำเร็จ');
      } catch (error) {
        console.error('ไม่สามารถยกเลิกการจองได้:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
      }
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking-details/${bookingId}`);
  };

  const isBookingActive = (booking) => {
    const now = dayjs().tz('Asia/Bangkok');
    return now.isBefore(dayjs(booking.endTime).tz('Asia/Bangkok'));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #EBEBEBFF, #FFFBFBFF)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container sx={{ flexGrow: 1, py: 4 }}>
        {loading ? (
          <Typography variant="h6" align="center">
            กำลังโหลดข้อมูล...
          </Typography>
        ) : error ? (
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {rooms.map((room) => {
              const bookingOfThisRoom = bookings.find((b) => b.room === room.name);
              const isRoomLocked = bookingOfThisRoom && isBookingActive(bookingOfThisRoom);
              const isRoomAvailable = !isRoomLocked && room.status === 'available';

              return (
                <Grid item xs={12} sm={6} key={room._id}>
                  <RoomCard status={room.status}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`${API.replace('/api', '')}/uploads/${room.image}`}
                      alt={`${room.name} Image`}
                      onError={() => {
                        console.error('Failed to load:', `${API.replace('/api', '')}/uploads/${room.image}`);
                      }}
                      onLoad={() => console.log('Loaded:', `${API.replace('/api', '')}/uploads/${room.image}`)}
                      onClick={() => {
                        if (room.status === 'unavailable') {
                          alert('ห้องนี้ถูกปิด ไม่สามารถจองได้');
                          return;
                        }
                        if (!isRoomAvailable) {
                          alert('ห้องนี้ไม่ว่าง');
                          return;
                        }
                        navigate('/booking');
                      }}
                      sx={{
                        pointerEvents: room.status === 'unavailable' || !isRoomAvailable ? 'none' : 'auto',
                        opacity: room.status === 'unavailable' || !isRoomAvailable ? 0.5 : 1,
                      }}
                    />
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography
                        variant="h5"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: isRoomAvailable ? 'success.main' : 'error.main',
                          opacity: isRoomAvailable ? 1 : 0.5,
                        }}
                      >
                        {room.name}
                      </Typography>
                      {bookingOfThisRoom ? (
                        <Box
                          sx={{
                            backgroundColor: '#fffde7',
                            borderRadius: 1,
                            p: 1,
                            mt: 1,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            ข้อมูลการจอง
                          </Typography>
                          <Typography variant="body2">
                            ชื่อผู้จอง: {bookingOfThisRoom.user?.fullName || 'ไม่ระบุ'}
                          </Typography>
                          <Typography variant="body2">
                            รหัสนักศึกษา: {bookingOfThisRoom.user?.studentId || 'ไม่ระบุ'}
                          </Typography>
                          <Typography variant="body2">
                            เวลา: {dayjs(bookingOfThisRoom.startTime).tz('Asia/Bangkok').format('HH:mm')} ถึง{' '}
                            {dayjs(bookingOfThisRoom.endTime).tz('Asia/Bangkok').format('HH:mm')}
                          </Typography>
                          <Typography variant="body2">
                            วันที่: {dayjs(bookingOfThisRoom.startTime).tz('Asia/Bangkok').format('DD MMMM YYYY')}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            {(role === 'admin' ||
                              (role === 'user' && bookingOfThisRoom.user?._id === userId)) && (
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleCancelBooking(bookingOfThisRoom._id)}
                              >
                                ยกเลิกการใช้งาน
                              </Button>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                          {room.status === 'unavailable' ? 'ห้องนี้ถูกปิด' : 'ห้องว่าง'}
                        </Typography>
                      )}
                      {role === 'admin' && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={room.status === 'available'}
                              onChange={() =>
                                handleStatusChange(
                                  room._id,
                                  room.status === 'available' ? 'unavailable' : 'available'
                                )
                              }
                              color="primary"
                            />
                          }
                          label={room.status === 'available' ? 'เปิด' : 'ปิด'}
                          sx={{ textAlign: 'center', mt: 2 }}
                        />
                      )}
                    </CardContent>
                  </RoomCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
      {bookingError && (
        <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
          {bookingError}
        </Typography>
      )}
      <Footer>
        <Typography variant="body2">ผู้ใช้: {role}</Typography>
      </Footer>
    </Box>
  );
};

export default Home;
