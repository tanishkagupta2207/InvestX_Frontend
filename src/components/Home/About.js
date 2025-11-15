import React from "react";
import NavBar from './NavBar';
import { FaGraduationCap, FaRobot, FaChartLine, FaUsers, FaChartArea, FaMoneyBillWave } from 'react-icons/fa';

const ACCENT_COLOR = 'rgb(9, 96, 29)'; // Define the signature green color

const AboutUs = () => {
    // We are maintaining the simplified margin here as there is no SideBar
    const mainContentMarginLeft = '0';

    // --- Theme-Matching Styles ---
    const cardStyle = {
        backgroundColor: '#1a1a1a', 
        color: '#f8f9fa', 
        border: '1px solid #363636', 
        borderRadius: '10px',
        padding: '25px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        minHeight: '250px', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    };
    
    const featureCardStyle = {
        ...cardStyle, // Inherit base style
        minHeight: '200px',
        padding: '20px',
        alignItems: 'flex-start', // Align text to the left
        textAlign: 'left',
    };

    const iconStyle = {
        color: ACCENT_COLOR, 
        fontSize: '3rem',
        marginBottom: '15px',
    };

    return (
        <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
            
            {/* FIX 1: NavBar should be placed at the top level outside of main */}
            <NavBar />
            
            <main
                className="main-content"
                style={{
                    marginLeft: mainContentMarginLeft, 
                    padding: "20px",
                    transition: 'margin-left 0.3s ease-in-out',
                    // FIX 2: Added padding-top to compensate for the fixed NavBar height (approx 3.5rem)
                    paddingTop: '3.5rem', 
                }}
            >
                <div className="container-fluid text-light">
                    
                    {/* Header Section */}
                    <div className="row mb-5" style={{ paddingTop: '20px' }}> {/* Add extra top padding for visual separation */}
                        <div className="col-12 text-center">
                            <h1 className="display-4 fw-bold mb-3">
                                Welcome to <span style={{ color: ACCENT_COLOR }}>InvestX</span>
                            </h1>
                            <p className="lead" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                Your ultimate virtual trading simulator designed to give you a holistic, risk-free view of the financial markets and turn you into a confident investor.
                            </p>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#363636' }} />

                    {/* Core Pillars Section (Original 3 cards) */}
                    <div className="row g-4 mb-5 justify-content-center">
                        
                        <div className="col-lg-4 col-md-6 d-flex">
                            <div className="w-100" style={cardStyle}>
                                <FaGraduationCap style={iconStyle} />
                                <h3 className="h5 fw-bold mb-3">Holistic Learning</h3>
                                <p>Trade stocks, mutual funds, and manage a diversified portfolio without losing real money. Learn every aspect of order types, market mechanics, and portfolio management.</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 d-flex">
                            <div className="w-100" style={cardStyle}>
                                <FaRobot style={iconStyle} />
                                <h3 className="h5 fw-bold mb-3">Personalized AI Agent</h3>
                                <p>Gain a competitive edge with our custom AI agent. It analyzes your current portfolio and investment decisions to provide personalized, data-driven suggestions and guidance.</p>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6 d-flex">
                            <div className="w-100" style={cardStyle}>
                                <FaChartLine style={iconStyle} />
                                <h3 className="h5 fw-bold mb-3">Real-Time Simulation</h3>
                                <p>Experience the market using realistic, simulated data (including intraday and daily price movements) to mirror real-world trading conditions and results.</p>
                            </div>
                        </div>
                    </div>
                    
                    <hr style={{ borderColor: '#363636' }} />

                    {/* NEW: Platform Features Section */}
                    <div className="row my-5">
                        <div className="col-12 text-center mb-4">
                            <h2 className="fw-bold">Platform Capabilities</h2>
                        </div>
                        
                        {/* 1. Stock Trading Feature */}
                        <div className="col-lg-4 col-md-6 d-flex mb-4">
                            <div className="w-100" style={featureCardStyle}>
                                <h3 className="fw-bold mb-2 d-flex align-items-center">
                                    <FaChartArea style={{ fontSize: '1.5rem', marginRight: '10px', color: ACCENT_COLOR }} /> 
                                    Simulated Stock Trading
                                </h3>
                                <p className="text-secondary">Explore thousands of stocks across various sectors. Learn to execute complex trading strategies with a full suite of order types:</p>
                                <ul className="list-unstyled">
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>Market Orders:</b> Immediate execution at the current simulated price.</li>
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>Limit, Stop-Loss, Stop-Limit, Take-Profit:</b> Master risk management by placing advanced, conditional orders.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 2. Mutual Fund Investment Feature */}
                        <div className="col-lg-4 col-md-6 d-flex mb-4">
                            <div className="w-100" style={featureCardStyle}>
                                <h3 className="fw-bold mb-2 d-flex align-items-center">
                                    <FaMoneyBillWave style={{ fontSize: '1.5rem', marginRight: '10px', color: ACCENT_COLOR }} /> 
                                    Mutual Fund Investing
                                </h3>
                                <p className="text-secondary">Learn the power of compounding and long-term wealth creation using various mutual fund schemes:</p>
                                <ul className="list-unstyled">
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>Market (Lump-Sum):</b> Invest or redeem units based on the end-of-day NAV.</li>
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>SIP (Systematic Investment Plan):</b> Practice scheduled, periodic 'Buy' orders (Daily, Weekly, Monthly).</li>
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>SWP (Systematic Withdrawal Plan):</b> Simulate periodic 'Sell' orders to manage income flow.</li>
                                </ul>
                            </div>
                        </div>
                        
                        {/* 3. Simulated Market Timings */}
                        <div className="col-lg-4 col-md-12 d-flex mb-4">
                            <div className="w-100" style={featureCardStyle}>
                                <h3 className="fw-bold mb-2 d-flex align-items-center">
                                    <FaChartLine style={{ fontSize: '1.5rem', marginRight: '10px', color: ACCENT_COLOR }} /> 
                                    Realistic Trade Timings
                                </h3>
                                <p className="text-secondary">Understand how trade timings affect order execution in a real market environment:</p>
                                <ul className="list-unstyled">
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>Stock Market:</b> Market orders for stocks are processed only during <b>simulated market hours</b>.</li>
                                    <li><span style={{ color: ACCENT_COLOR }}>&#10003;</span> <b>Mutual Funds:</b> Orders (Market, SIP, SWP) are accepted anytime but are <b>PENDING</b> until they are processed against the next available end-of-day <b>NAV</b>.</li>
                                </ul>
                                <p className="mt-2" style={{ color: ACCENT_COLOR, fontSize: '0.9rem' }}>
                                    <i>Note: This mimics how real-world orders interact with current price data and scheduled NAV releases.</i>
                                </p>
                            </div>
                        </div>

                    </div>


                    {/* Our Mission & CTA Section (Retained) */}
                    <hr style={{ borderColor: '#363636' }} />

                    <div className="row my-5">
                        <div className="col-12 text-center">
                            <h2 className="fw-bold mb-4">Our Mission</h2>
                            <blockquote className="blockquote" style={{ maxWidth: '900px', margin: '0 auto', borderLeft: `4px solid ${ACCENT_COLOR}`, paddingLeft: '20px', fontStyle: 'italic' }}>
                                <p className="mb-0 fs-5">
                                    "To democratize financial knowledge by providing a risk-free, comprehensive platform where aspiring investors can learn, practice, and build confidence before they ever commit real capital."
                                </p>
                                <footer className="blockquote-footer mt-2 text-end">
                                    The InvestX Team
                                </footer>
                            </blockquote>
                        </div>
                    </div>

                    <div className="row pt-4 pb-5 justify-content-center">
                        <div className="col-lg-8 col-md-10 d-flex">
                            <div className="w-100" style={cardStyle}>
                                <FaUsers style={iconStyle} />
                                <h3 className="h5 fw-bold mb-3">Join the Community</h3>
                                <p>
                                    InvestX is built for new users to gain a holistic view of trading. Join thousands of users on their journey from novice to confident investor. Start trading today!
                                </p>
                                <button 
                                    className="btn mt-3" 
                                    style={{ 
                                        backgroundColor: ACCENT_COLOR, 
                                        color: "white", 
                                        borderColor: ACCENT_COLOR 
                                    }}
                                    onClick={() => window.location.href = "/signup"}
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AboutUs;