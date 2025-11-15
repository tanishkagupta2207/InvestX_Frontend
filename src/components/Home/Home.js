import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import img1 from "../../assets/img1.webp"; 
import img2 from "../../assets/home_img2.webp"; 

// --- Theme Constants ---
const ACCENT_COLOR = "rgb(9, 96, 29)"; // Signature Green
const TEXT_COLOR = "#f8f9fa"; // Light Text
const DARK_BG = "black";
const SECTION_PADDING = '80px 20px'; // Consistent padding for all sections

// Simple Keyframes for Slide-Up (Ideally defined in global CSS or a styled component library)
// We define them here as strings for demonstration purposes only.
const animationStyles = {
    // Hidden state
    initial: { opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.8s ease-out, transform 0.8s ease-out' },
    // Visible state
    visible: { opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.8s ease-out, transform 0.8s ease-out' },
};


const Home = () => {
    const token = localStorage.getItem("token");

    // State to track animation visibility (In a real app, this would use Intersection Observer)
    const [section2Visible, setSection2Visible] = useState(false);
    const [section3Visible, setSection3Visible] = useState(false);
    const [section4Visible, setSection4Visible] = useState(false);

    // Placeholder useEffect for animation trigger (Replace with Intersection Observer logic)
    useEffect(() => {
        // This simulates instant loading animation for demonstration.
        // For production, you'd use a robust library.
        const timer = setTimeout(() => {
            setSection2Visible(true);
            setTimeout(() => setSection3Visible(true), 300); // Stagger the next section
            setTimeout(() => setSection4Visible(true), 600); // Stagger the next section
        }, 100); 

        return () => clearTimeout(timer);
    }, []);

    // --- Reusable Inline Styles ---
    const darkBackgroundStyle = { backgroundColor: DARK_BG, minHeight: "100vh", color: TEXT_COLOR };
    const accentColorStyle = { color: ACCENT_COLOR };
    const textCenterStyle = { textAlign: "center" };
    
    // Style for the entire page container
    const mainPageStyle = { 
        ...darkBackgroundStyle, 
        fontFamily: 'Arial, sans-serif' 
    };

    const heroHeadingStyle = {
        fontSize: '3.5rem', 
        fontWeight: '800',
        marginBottom: '10px',
        lineHeight: '1.2',
        color: 'white',
    };

    const ctaButtonStyle = {
        backgroundColor: ACCENT_COLOR,
        color: "white",
        borderColor: ACCENT_COLOR,
        fontWeight: "bold",
        padding: '12px 30px',
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-block',
        marginTop: '20px',
        transition: 'background-color 0.3s, transform 0.2s',
    };

    const sectionContentStyle = {
        padding: SECTION_PADDING,
        backgroundColor: DARK_BG,
    };
    
    const imageContainerStyle = {
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const imageStyle = {
        width: "100%", 
        maxWidth: "550px", 
        aspectRatio: "1.5",
        borderRadius: "15px", 
        boxShadow: `0 0 20px rgba(9, 96, 29, 0.4)`, 
        objectFit: 'cover'
    };

    // --- Component JSX ---

    return (
        <div style={mainPageStyle}>
            <NavBar />
            
            {/* Added padding to account for fixed NavBar height */}
            <div style={{ 'paddingTop': '3.5rem' }}></div> 

            <div className="container-fluid">
                
                {/* --- 1. HERO SECTION (Always visible) --- */}
                <section style={{ ...sectionContentStyle, padding: '100px 20px' }}>
                    <div className="container" style={textCenterStyle}>
                        <h1 style={heroHeadingStyle}>
                            <span style={accentColorStyle}>InvestX:</span> Learn, Invest, Master Your Finances
                        </h1>
                        <p
                            style={{
                                color: TEXT_COLOR,
                                fontSize: "1.4rem",
                                maxWidth: '800px',
                                margin: '0 auto 30px auto',
                            }}
                        >
                            The ultimate virtual trading simulator designed to give you a <b>holistic, risk-free view</b> of the financial markets and transform you into a confident investor.
                        </p>
                        
                        <div style={{...textCenterStyle, marginBottom: '20px', fontSize: '1.1rem'}}>
                            <p>💰 <b>Start with $100,000 in virtual cash.</b> Practice real strategies, analyze outcomes, and build your dream portfolio without any actual risk.</p>
                        </div>
                        
                        <div className="container" style={{ textAlign: 'center' }}>
                            <Link
                                to={token ? "/dashboard" : "/signup"}
                                style={ctaButtonStyle}
                            >
                                {token ? "Go to Dashboard" : "Start Your Free Simulation"}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- 2. REAL-TIME MARKET SECTION (Animated) --- */}
                <section 
                    style={{ ...sectionContentStyle, ...textCenterStyle, ...(section2Visible ? animationStyles.visible : animationStyles.initial) }}
                >
                    <div className="container">
                        <div className="row align-items-center">
                            
                            {/* Image (Left on MD+) */}
                            <div className="col-12 col-md-6" style={imageContainerStyle}>
                                <img
                                    style={imageStyle}
                                    src={img1}
                                    alt="trading dashboard simulation"
                                />
                            </div>
                            
                            {/* Text (Right on MD+) */}
                            <div className="col-12 col-md-6" style={{ padding: '20px', textAlign: 'left' }}>
                                <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '15px' }}>
                                    Real-Time Market Simulation
                                </h2>
                                <hr style={{ borderColor: ACCENT_COLOR, opacity: 1, width: '100px', margin: '0 0 20px 0', borderTopWidth: '3px' }}/>
                                <p style={{ color: TEXT_COLOR, fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                    Experience the thrill of the market using <b>simulated price feeds, intraday data, and accurate NAV releases</b>. Place orders just like a pro and track your performance with <b>XIRR</b> calculations and detailed portfolio analytics.
                                </p>
                                <ul style={{ color: TEXT_COLOR, listStyleType: 'none', paddingLeft: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>✅ <b>Full Order Suite:</b> Market, Limit, Stop-Loss, Stop-Limit, Take-Profit.</li>
                                    <li style={{ marginBottom: '10px' }}>✅ <b>Comprehensive Instruments:</b> Stocks, Equity, and Mutual Funds (SIP/SWP enabled).</li>
                                    <li style={{ marginBottom: '10px' }}>✅ <b>Realistic Timings:</b> Orders respect simulated market hours and NAV schedules.</li>
                                </ul>
                                <Link
                                    to={token ? "/dashboard" : "/about"}
                                    style={ctaButtonStyle}
                                >
                                    View Features
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. AI ASSISTANT SECTION (Animated) --- */}
                <section 
                    style={{ ...sectionContentStyle, ...textCenterStyle, ...(section3Visible ? animationStyles.visible : animationStyles.initial) }}
                >
                    <div className="container">
                        {/* Use flex-md-row-reverse to swap column order on desktop */}
                        <div className="row align-items-center flex-md-row-reverse"> 
                            
                            {/* Image (Right on MD+, Top on Mobile) */}
                            <div className="col-12 col-md-6" style={imageContainerStyle}>
                                <img
                                    style={imageStyle}
                                    src={img2}
                                    alt="ai trading assistant interface"
                                />
                            </div>
                            
                            {/* Text (Left on MD+, Bottom on Mobile) */}
                            <div className="col-12 col-md-6" style={{ padding: '20px', textAlign: 'left' }}>
                                <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '15px' }}>
                                    Your <span style={accentColorStyle}>AI-Powered</span> Trading Mentor
                                </h2>
                                <hr style={{ borderColor: ACCENT_COLOR, opacity: 1, width: '100px', margin: '0 0 20px 0', borderTopWidth: '3px' }}/>
                                <p style={{ color: TEXT_COLOR, fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                    Soon, our integrated AI agent will become your <b>personal investment advisor</b>. It will analyze your current holdings, risk tolerance, and historical decisions to provide <b>personalized, actionable suggestions</b> with detailed reasoning.
                                </p>
                                <ul style={{ color: TEXT_COLOR, listStyleType: 'none', paddingLeft: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>🧠 <b>Personalized Analysis:</b> Tailored suggestions based on your InvestX portfolio.</li>
                                    <li style={{ marginBottom: '10px' }}>📈 <b>Strategic Guidance:</b> Suggestions for diversification, entry/exit points, and risk mitigation.</li>
                                    <li style={{ marginBottom: '10px' }}>🛠️ <b>Holistic Learning:</b> Understand *why* a decision is good or bad, moving beyond simple signals.</li>
                                </ul>
                                <Link
                                    to={token ? "/dashboard" : "/signup"}
                                    style={ctaButtonStyle}
                                >
                                    Start Building Your Strategy
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* --- 4. LEARNING & ANALYSIS SECTION (Animated) --- */}
                <section 
                    style={{ ...sectionContentStyle, ...textCenterStyle, ...(section4Visible ? animationStyles.visible : animationStyles.initial) }}
                >
                    <div className="container">
                        <div className="row align-items-center">
                            {/* Text (Left on MD+) */}
                            <div className="col-12 col-md-6" style={{ padding: '20px', textAlign: 'left' }}>
                                <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '15px' }}>
                                    Master Investment Strategies
                                </h2>
                                <hr style={{ borderColor: ACCENT_COLOR, opacity: 1, width: '100px', margin: '0 0 20px 0', borderTopWidth: '3px' }}/>
                                <p style={{ color: TEXT_COLOR, fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                    Move beyond simple paper trading. InvestX equips you with the tools to <b>deeply analyze your simulated performance</b> and refine your approach like a professional fund manager.
                                </p>
                                <ul style={{ color: TEXT_COLOR, listStyleType: 'none', paddingLeft: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>📊 <b>Performance Metrics:</b> Review total profit, cash balance, and money invested.</li>
                                    <li style={{ marginBottom: '10px' }}>🧪 <b>Strategy Testing:</b> Backtest different order types and holding periods without consequence.</li>
                                    <li style={{ marginBottom: '10px' }}>🔄 <b>Holistic Portfolio View:</b> See asset allocation (Stocks, MFs, Cash) and sector-wise exposure.</li>
                                    <li style={{ marginBottom: '10px' }}>📝 <b>Transaction History:</b> Detailed logs to review trade prices and quantities.</li>
                                </ul>
                                <Link
                                    to={token ? "/dashboard" : "/signup"}
                                    style={ctaButtonStyle}
                                >
                                    View Detailed Analytics
                                </Link>
                            </div>
                            
                            {/* Placeholder Image/Chart (Right on MD+) - Use a new image/icon set later */}
                            <div className="col-12 col-md-6 d-none d-md-flex justify-content-center align-items-center" style={{ height: '300px', padding: '20px' }}>
                                <div style={{...textCenterStyle, fontSize: '1.5rem', border: `2px dashed ${ACCENT_COLOR}`, padding: '30px', borderRadius: '10px', maxWidth: '300px'}}>
                                    [Placeholder for Analytics Chart Image]
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FOOTER (Always Visible) --- */}
                <footer style={{ backgroundColor: '#1a1a1a', padding: '30px 0', borderTop: `1px solid ${ACCENT_COLOR}` }}> 
                    <div className="container">
                        <div className="row" style={{ color: TEXT_COLOR, textAlign: 'center' }}>
                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white' }}>Quick Links</h3>
                                <div style={{ fontSize: '1rem' }}>
                                    <Link to="/about" style={{ color: ACCENT_COLOR, margin: '5px 0', display: 'block', textDecoration: 'none' }}>About Us</Link>
                                    <Link to="/contact" style={{ color: ACCENT_COLOR, margin: '5px 0', display: 'block', textDecoration: 'none' }}>Contact</Link>
                                    <Link to="/privacy" style={{ color: ACCENT_COLOR, margin: '5px 0', display: 'block', textDecoration: 'none' }}>Privacy Policy</Link>
                                </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white' }}>Support</h3>
                                <div style={{ fontSize: '1rem' }}>
                                    <p style={{marginBottom: 0}}>Email: tanishkagupta2207@gmail.com</p>
                                    <p>Phone: +91 9149014514</p>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'white' }}>Follow Us</h3>
                                <div style={{ fontSize: '1rem' }}>
                                    <a href="/" style={{ color: ACCENT_COLOR, margin: '0 10px', textDecoration: 'none' }}>Facebook</a> | 
                                    <a href="/" style={{ color: ACCENT_COLOR, margin: '0 10px', textDecoration: 'none' }}>Twitter</a> |
                                    <a href="/" style={{ color: ACCENT_COLOR, margin: '0 10px', textDecoration: 'none' }}>Instagram</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ color: TEXT_COLOR, textAlign: 'center', padding: '10px 0', fontSize: '0.9rem', marginTop: '20px', borderTop: '1px solid #333' }}>
                        <p style={{marginBottom: 0}}>&copy; 2025 InvestX. All Rights Reserved. Virtual Trading Simulator.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;