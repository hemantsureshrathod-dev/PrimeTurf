import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BroadcastBanner from './components/BroadcastBanner';
import Home from './pages/Home';
import Book from './pages/Book';
import MyBookings from './pages/MyBookings';
import Receipt from './pages/Receipt';
import Admin from './pages/Admin';
import { useApp } from './AppContext';
import Login from './pages/Login';

// Inside your <Routes>:


function App() {
  const { broadcastBanner } = useApp();

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {/* Global Broadcast Banner */}
        {broadcastBanner && broadcastBanner.active && (
          <BroadcastBanner text={broadcastBanner.text} />
        )}

        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Main Content Layout */}
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Book />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/receipt/:id" element={<Receipt />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



