import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { Account } from './pages/Account';
import { Admin } from './pages/Admin';
import { DataDeletion } from './pages/DataDeletion';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-white text-stone-800">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/data-deletion" element={<DataDeletion />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
