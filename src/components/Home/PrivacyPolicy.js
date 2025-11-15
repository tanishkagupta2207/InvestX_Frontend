import React from "react";
import NavBar from '../Home/NavBar';

const ACCENT_COLOR = 'rgb(9, 96, 29)'; // Signature Green
const TEXT_COLOR = '#f8f9fa'; // Light Text
const DARK_BG = "black";

const PrivacyPolicy = () => {
    
    const pageStyle = { backgroundColor: DARK_BG, minHeight: "100vh", color: TEXT_COLOR, paddingTop: '3.5rem' };
    const headingStyle = { color: 'white', borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: '5px', marginBottom: '20px' };
    const subHeadingStyle = { color: ACCENT_COLOR, marginTop: '20px', marginBottom: '10px' };

    return (
        <div style={pageStyle}>
            <NavBar />
            
            <main className="container">
                <h1 className="display-4 fw-bold mb-4" style={headingStyle}>
                    InvestX Privacy Policy
                </h1>
                <p className="lead text-secondary">
                    Effective Date: November 15, 2025
                </p>

                <div style={{ padding: '20px 0' }}>
                    <p>
                        At InvestX, we are committed to protecting your privacy. This policy explains how we collect, use, and share information related to your use of our virtual trading simulator platform.
                    </p>

                    <h2 style={subHeadingStyle}>1. Information We Collect</h2>
                    <p>We collect information necessary to provide and improve the virtual trading service:</p>
                    
                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginTop: '15px' }}>Personal Data</h3>
                    <ul>
                        <li><b>User Identification:</b> Name, Username, and Email address (provided during registration).</li>
                        <li><b>Account Status:</b> Profile type (Public or Private) and authentication token.</li>
                    </ul>

                    <h3 style={{ color: 'white', fontSize: '1.2rem', marginTop: '15px' }}>Virtual Trading Data</h3>
                    <ul>
                        <li><b>Portfolio Information:</b> Simulated cash balance, initial balance, total portfolio value, and XIRR calculation data.</li>
                        <li><b>Holdings:</b> Details of stocks and mutual fund units held (quantity, average price, security type).</li>
                        <li><b>Transaction History:</b> Logs of all simulated buys, sells, and fund movements, including dates and prices.</li>
                        <li><b>Order History:</b> Records of pending, filled, and rejected limit/stop orders, SIPs, and SWPs.</li>
                        <li><b>Watchlists:</b> Custom lists of tracked companies and securities.</li>
                    </ul>

                    <h2 style={subHeadingStyle}>2. How We Use Your Information</h2>
                    <p>Your data is used exclusively to operate, maintain, and improve the simulator:</p>
                    <ul>
                        <li>To enable trading and calculate portfolio performance metrics (e.g., total value, profit, XIRR).</li>
                        <li>To provide personalized investment suggestions via the AI agent (future feature).</li>
                        <li>To display public portfolios to other users, if your profile is set to "Public".</li>
                        <li>To facilitate the execution and tracking of orders and recurring investments (SIP/SWP).</li>
                    </ul>

                    <h2 style={subHeadingStyle}>3. Data Sharing and Disclosure</h2>
                    <p>We do not share your personal identification data (Name, Email) with third parties. We only disclose:</p>
                    <ul>
                        <li><b>Public Portfolio Data:</b> If your profile type is set to "Public," your holdings and performance metrics may be viewable by other users via your unique portfolio link.</li>
                        <li><b>Legal Compliance:</b> If required by law or subpoena.</li>
                    </ul>
                    
                    <h2 style={subHeadingStyle}>4. Data Security</h2>
                    <p>We use reasonable measures to protect your data, including secure transmission and storage of sensitive information like authentication tokens.</p>
                    
                    <h2 style={subHeadingStyle}>5. Your Choices</h2>
                    <p>You have control over your visibility:</p>
                    <ul>
                        <li><b>Profile Visibility:</b> You can change your profile setting between "Public" and "Private" at any time through your account settings.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;