import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import BookingsList from './pages/BookingsList';


const App = () => {
  return (
    <Router>
      <Layout>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/bookings" element={<BookingsList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} /> 
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
