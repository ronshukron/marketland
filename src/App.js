// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./contexts/authContext";
import Menu from './components/Menu';
import Home from './components/Home';
import Producers from './components/Producers';
import ProducerDetails from './components/ProducerDetails';
import CreateOrder from './components/CreateOrder';
import Signup from './components/auth/register/index';
import Login from './components/auth/login/index.jsx';
import OrderForm from './components/OrderForm';
import OrderSummary from './components/OrderSummary';
import OrderConfirmation from './components/OrderConfirmation';
import Dashboard from './components/Dashboard.js';


const App = () => {
  return (
    <Router>
      <AuthProvider>  {/* Wrap all routes with AuthProvider */}
        <Menu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producers" element={<Producers />} />
          <Route path="/producers/:producerId" element={<ProducerDetails />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order-form/:orderId" element={<OrderForm />} />
          <Route path="/order-summary/:orderId" element={<OrderSummary />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
