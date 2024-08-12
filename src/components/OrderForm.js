import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase/firebase'; // Adjust depending on the actual file name and location
import './OrderForm.css';
import LoadingSpinner from './LoadingSpinner';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const OrderForm = () => {
    const { orderId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [producerInfo, setProducerInfo] = useState({});
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const orderDoc = doc(db, "Orders", orderId);
            const docSnap = await getDoc(orderDoc);

            if (docSnap.exists()) {
                fetchProducerDetails(docSnap.data().Producer_ID);
            } else {
                console.log("No such document!");
                navigate('/error');
            }
            setLoading(false);
        };

        fetchOrderDetails();
    }, [orderId, navigate]);

    const fetchProducerDetails = async (producerId) => {
        const producerDoc = doc(db, "Producers", producerId);
        const docSnap = await getDoc(producerDoc);

        if (docSnap.exists()) {
            const producerData = docSnap.data();
            setProducerInfo({
                image: producerData.Image,
                kind: producerData.Kind,
                location: producerData.Location,
                name: producerData.Name
            });
            const extractedProducts = Object.keys(producerData)
                .filter(key => key.startsWith('Product_'))
                .map(key => ({
                    id: key,
                    description: producerData[key].Description,
                    name: producerData[key].Name,
                    price: producerData[key].Price,
                    images: producerData[key].Images,
                    options: producerData[key].Options || []
                }));
            setProducts(extractedProducts.map(product => ({
                ...product,
                selectedOption: product.options.length > 0 ? product.options[0] : null,
                quantity: 0,
                uid: `${product.name}_${Math.random().toString(36).substr(2, 9)}` // Unique identifier for each entry
            })));
        } else {
            console.log("Producer document not found!");
        }
    };

    const handleQuantityChange = (index, increment) => {
        setProducts(products.map((product, i) => {
            if (i === index) {
                return { ...product, quantity: increment ? product.quantity + 1 : Math.max(product.quantity - 1, 0) };
            }
            return product;
        }));
    };

    const handleOptionChange = (index, newOption) => {
        setProducts(products.map((product, i) => {
            if (i === index) {
                return { ...product, selectedOption: newOption };
            }
            return product;
        }));
    };

    const addNewProductEntry = (productIndex) => {
        const productToCopy = products[productIndex];
        const newProduct = { ...productToCopy, selectedOption: productToCopy.options[0], quantity: 0, uid: `${productToCopy.name}_${Math.random().toString(36).substr(2, 9)}` };
        setProducts([
            ...products.slice(0, productIndex + 1),
            newProduct,
            ...products.slice(productIndex + 1)
        ]);
    };

    // Function to handle the deletion of a product entry
    const handleDeleteProduct = (productIndex) => {
        setProducts(products.filter((_, index) => index !== productIndex));
    };

    const handleSubmitOrder = async () => {
        const orderDocRef = doc(db, "Orders", orderId);
        let newMemberData = {};
        const memberKey = `Member_${new Date().getTime()}`;
        newMemberData[`${memberKey}.Name`] = userName;
        let totalOrderValue = 0;

        products.forEach(product => {
            const quantity = product.quantity;
            if (quantity > 0) {
                // Use the unique identifier to differentiate between similar products
                newMemberData[`${memberKey}.${product.uid}`] = {
                    Name: product.name,
                    Quantity: product.quantity,
                    Price: product.price,
                    Option: product.selectedOption || "None"
                };
                totalOrderValue += quantity * product.price;
            }
        });

        try {
            const orderDocSnap = await getDoc(orderDocRef);
            const currentTotalAmount = orderDocSnap.exists() ? (orderDocSnap.data().Total_Amount || 0) : 0;
            const updatedTotalAmount = currentTotalAmount + totalOrderValue;

            await updateDoc(orderDocRef, {
                ...newMemberData,
                Total_Amount: updatedTotalAmount
            });

            console.log('Order updated successfully');
            const orderedItems = products.map(product => ({
                name: product.name,
                quantity: product.quantity || 0,
                price: product.price
            }));
            navigate('/order-confirmation', { state: { orderedItems } });
        } catch (error) {
            console.error("Failed to update order:", error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    // Slider settings
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <div className="order-form-container">
            <div className="header-section">
                <h1>טופס הזמנה עבור {producerInfo.name}</h1>
                {producerInfo.image && (
                    <img className="producer-image" src={producerInfo.image} alt={`Image of ${producerInfo.name}`} />
                )}
                <div className="producer-details">
                    <p><strong>סוג:</strong> {producerInfo.kind}</p>
                    <p><strong>מיקום:</strong> {producerInfo.location}</p>
                </div>
            </div>
            {products.map((product, index) => (
                <div key={index} className="product-item">
                    <h3>{product.name} - ₪{product.price}</h3>
                    <p>{product.description}</p>
                    {product.images.length > 0 && (
                        <Slider className='slider' {...settings}>
                            {product.images.map((image, idx) => (
                                <div key={idx} className="slider-image-container">
                                    <img src={image} alt={`Image ${idx + 1} for ${product.name}`} className="product-image" />
                                </div>
                            ))}
                        </Slider>
                    )}
                    {product.options.length > 0 && (
                        <div className="options-dropdown">
                            <select
                                value={product.selectedOption || ''}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                            >
                                {product.options.map((option, idx) => (
                                    <option key={idx} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="quantity-controls">
                        <button onClick={() => handleQuantityChange(index, false)}>-</button>
                        <span>{product.quantity || 0}</span>
                        <button onClick={() => handleQuantityChange(index, true)}>+</button>
                    </div>
                    {/* <div className="button-container">
                        <button className="add-entry-button" onClick={() => addNewProductEntry(index)}>הוסף סוג נוסף ממוצר זה</button>
                        <button className="delete-entry-button" onClick={() => handleDeleteProduct(index)}>הסר מוצר</button>
                    </div> */}
                </div>
            ))}
            <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="name-input"
            />
            <button onClick={handleSubmitOrder} className="submit-button">Submit Order</button>
        </div>
    );
};

export default OrderForm;
