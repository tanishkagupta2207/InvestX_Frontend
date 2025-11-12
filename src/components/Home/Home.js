import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import img1 from "../../assets/img1.webp";
import NavBar from "./NavBar";
import img2 from "../../assets/home_img2.webp";

const Home = () => {
    const token = localStorage.getItem("token");

    // Reusable styles for centering/flex containers
    const flexCenterStyle = { display: "flex", justifyContent: "center" };
    const textCenterStyle = { textAlign: "center" };

    return (
        <>
            {/* Added padding to account for fixed NavBar height */}
            <div style={{ 'paddingTop': '3.5rem' }}></div> 
            <NavBar />
            
            <div className="container_1">
                
                {/* --- 1. HERO SECTION --- */}
                <section>
                    <div className="container heading_start" style={textCenterStyle}>
                        InvestX <br /> Learn, Invest, Master
                    </div>
                    <div
                        style={{
                            color: "#fff",
                            ...flexCenterStyle,
                            fontSize: "1.3rem",
                            padding: '0 20px', // Added horizontal padding for small screens
                            textAlign: 'center',
                        }}
                    >
                        Simulate real-market experience and enhance Financial skills
                    </div>
                    <div className="container" style={flexCenterStyle}>
                        <Link
                            to={token ? "/dashboard" : "/signup"}
                            className="button_start"
                        >
                            {token ? "Go to Dashboard" : "Get Started"}
                        </Link>
                    </div>
                </section>

                {/* --- 2. REAL-TIME MARKET SECTION (Image Left, Text Right on Desktop) --- */}
                {/* Assuming container_2 uses flex/grid and wraps on small screens */}
                <section className="container_2 responsive-section" style={{ flexDirection: 'row' }}>
                    
                    {/* Image Container */}
                    <div className="image-wrapper responsive-half" /* Removed flexBasis: "50%" */>
                        <img
                            style={{
                                width: "100%", // Fill parent container width
                                maxWidth: "500px", // Max size for desktop images
                                aspectRatio: "1.5",
                                margin: "20px auto", // Reduced margin, centered image
                                display: "block",
                                borderRadius: "20px", // Reduced border radius for better mobile look
                            }}
                            src={img1}
                            alt="trading dashboard simulation"
                        />
                    </div>
                    
                    {/* Text Container */}
                    <div className="flex-container_2 responsive-half" /* Removed flexBasis: "50%" */ style={{ padding: '20px' }}>
                        <h1 className="heading_2">Real-Time Market Simulation</h1>
                        <hr className="full-width-border_2"></hr>
                        <p className="text-block_2_2">
                            "Trade in a risk-free environment with real-time market data. Our
                            platform mirrors real-world stock movements, allowing you to
                            practice strategies, refine your skills, and gain confidence
                            before investing real money." Key Features: Live market data &
                            price fluctuations, Simulated portfolio tracking, Learn trading
                            without financial risk
                        </p>
                        <Link
                            to={token ? "/dashboard" : "/signup"}
                            className="button_start"
                            style={{ marginTop: "10px" }} // Align button left by default
                        >
                            {token ? "Go to Dashboard" : "Get Started"}
                        </Link>
                    </div>
                </section>
                
                {/* --- 3. AI ASSISTANT SECTION (Text Left, Image Right on Desktop) --- */}
                {/* Added 'reverse' style for mobile, typically achieved via CSS class or flex-direction: row-reverse */}
                <section className="container_2 responsive-section reverse-on-mobile" style={{ flexDirection: 'row-reverse' }}>
                    
                    {/* Image Container (Appears on the right on desktop due to 'row-reverse' in inline style) */}
                    <div className="image-wrapper responsive-half" /* Removed flexBasis: "50%" */>
                        <img
                            style={{
                                width: "100%",
                                maxWidth: "500px",
                                aspectRatio: "1.5",
                                margin: "20px auto",
                                display: "block",
                                borderRadius: "20px",
                            }}
                            src={img2}
                            alt="ai trading assistant interface"
                        />
                    </div>
                    
                    {/* Text Container (Appears on the left on desktop) */}
                    <div className="flex-container_2 responsive-half" /* Removed flexBasis: "50%" */ style={{ padding: '20px' }}>
                        <h1 className="heading_2">AI-Powered Trading Assistant</h1>
                        <hr className="full-width-border_2"></hr>
                        <p className="text-block_2_2">
                            "Our AI doesn't just suggest trades—it explains why. Get real-time
                            insights, risk analysis, and personalized recommendations backed
                            by financial data and trends, helping you make informed decisions
                            like a pro." Key Features: AI-driven trade suggestions with
                            reasoning, Risk analysis & strategy recommendations, Personalized
                            insights based on market trends
                        </p>
                        {/* FIX: Removed fixed margin that caused button misalignment */}
                        <Link
                            to={token ? "/dashboard" : "/signup"}
                            className="button_start"
                            style={{ marginTop: "10px" }} 
                        >
                            {token ? "Go to Dashboard" : "Get Started"}
                        </Link>
                    </div>

                </section>

                {/* --- FOOTER --- */}
                <footer> 
                    <div className="footer-container" style={{ padding: '20px', textAlign: 'center' }}>
                        <div className="footer-section social">
                            <h2>Follow Us</h2>
                            <p>
                                <a href="/">Facebook </a> | <a href="/"> Twitter </a> |
                                <a href="/"> Instagram</a>
                            </p>
                        </div>
                    </div>
                    <div className="footer-bottom" style={{ textAlign: 'center', padding: '10px 0' }}>
                        <p>&copy; 2025 YourWebsite. All Rights Reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;