import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import img1 from "../../assets/img1.webp";
import NavBar from "../NavBar";
import img2 from "../../assets/home_img2.webp";

const Home = () => {
  const token = JSON.parse(localStorage.getItem("token"));

  return (
    <>
      <NavBar />
      <div className="container_1">
        <section>
          <div className="container heading_start">
            InvestX <br /> Learn, Invest, Master
          </div>
          <div
            style={{
              color: "#fff",
              justifyContent: "center",
              display: "flex",
              fontSize: "1.3rem",
            }}
          >
            Simulate real-market experience and enhance Financial skills
          </div>
          <div
            className="container"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Link
              to={token ? "/dashboard" : "/signup"}
              className="button_start"
            >
              {token ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </section>

        <section className="container_2">
          <div style={{ flexBasis: "50%" }}>
            <img
              style={{
                width: "90%",
                aspectRatio: "1.5",
                margin: "75px",
                borderRadius: "50px",
              }}
              src={img1}
              alt="teaching finance"
            />
          </div>
          <div className="flex-container_2" style={{ flexBasis: "50%" }}>
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
              style={{ marginTop: "10px", marginLeft: "10px" }}
            >
              {token ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </section>

        <section className="container_2">
          
          <div className="flex-container_2" style={{ flexBasis: "50%" }}>
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
            <Link
              to={token ? "/dashboard" : "/signup"}
              className="button_start"
              style={{ marginTop: "10px", marginLeft: "470px" }}
            >
              {token ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>

          <div style={{ flexBasis: "50%" }}>
            <img
              style={{
                width: "90%",
                aspectRatio: "1.5",
                borderRadius: "50px",
                marginTop: "75px",                
                marginBottom: "75px",
              }}
              src={img2}
              alt="teaching finance"
            />
          </div>
        </section>

        <footer>                                      {/* TODO */}
          <div class="footer-container">
            <div class="footer-section social">
              <h2>Follow Us</h2>
              <a href="/">Facebook </a> | <a href="/"> Twitter </a> |
              <a href="/"> Instagram</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 YourWebsite. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
