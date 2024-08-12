import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './OrderConfirmation.css';
import LoadingSpinner from './LoadingSpinner';

const OrderConfirmation = () => {
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { orderedItems } = location.state || { orderedItems: [] };

    if (!orderedItems || orderedItems.length === 0) {
        return <div className="confirmation-container">No order details available.</div>;
    }

    const total = orderedItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

        // if (loading) {
        //     return <LoadingSpinner />;
        // }

    return (
        <div className="confirmation-container">
            <h1>תודה לך על ההזמנה</h1>
            <h2>פרטי ההזמנה</h2>
            <ul>
                {orderedItems.map((item, index) => (
                    <li key={index}>{item.name} - {item.quantity} x {item.price}₪ = {item.quantity * item.price}₪</li>
                ))}
            </ul>
            <h3>סה"כ: {total.toFixed(2)}₪</h3>
        </div>
    );
};

export default OrderConfirmation;
