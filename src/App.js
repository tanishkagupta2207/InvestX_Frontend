import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react"; // 1. Import useEffect
import '@flaticon/flaticon-uicons/css/regular/rounded.css'; 
import Home from "./components/Home/Home";
import About from "./components/Home/About";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";
import Alert from "./components/utils/Alert";
import Dashboard from "./components/pages/landing/Dashboard";
import TradePage from "./components/pages/TradePage";
import BuySellPage from "./components/pages/BuySellPage";
import OrderPage from "./components/pages/OrdersPage";
import TransactionsPage from "./components/pages/TransactionsPage";
import WatchListPage from "./components/pages/WatchListPage";
import PortfolioPage from "./components/pages/PortfolioPage";
import AccountPage from "./components/pages/AccountPage";
import PrivacyPolicy from "./components/Home/PrivacyPolicy";
import ContactUs from "./components/Home/ContactUs";
import MutualFundPage from "./components/pages/MutualFundPage";
import ChatPage from "./components/pages/ChatPage"; // Ensure path is correct (components/pages/ChatPage or components/pages/chat/ChatPage)

function App() {
  const [alert, setAlert] = useState(null);
  
  // 2. Add State for User
  const [user, setUser] = useState(null);

  const showAlert = (message, type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
        setAlert(null);
    }, 3000);
  }

  // 3. Add Function to Fetch User Data
  const getUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Don't fetch if no token

    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/auth/getUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user); // Set the user data here
      } else {
        console.error("Failed to fetch user:", data.msg);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  // 4. Run getUser on App Mount
  useEffect(() => {
    getUser();
  }, []);

  return (
    <div style={{'backgroundColor': '#000'}}>
        <Router>
        <Alert alert={alert}/>
          <div >
            <Routes>
              <Route exact path="/" element={<Home/>} />
              <Route exact path="/about" element={<About />} />
              <Route exact path="/privacy" element={<PrivacyPolicy />} />
              <Route exact path="/contact" element={<ContactUs showAlert={showAlert}/>} />
              
              {/* Note: You might want to reload user after login */}
              <Route exact path="/login" element={<Login showAlert={showAlert} />} /> 
              <Route exact path="/signup" element={<Signup showAlert={showAlert}/>} />
              
              <Route exact path="/dashboard" element={<Dashboard showAlert={showAlert}/>} />
              <Route exact path="/stocks" element={<TradePage showAlert={showAlert}/>} />
              <Route exact path="/trade/action" element={<BuySellPage showAlert={showAlert}/>} />
              <Route exact path="/mutualfunds" element={<MutualFundPage showAlert={showAlert}/>} />
              <Route exact path = '/orders' element={<OrderPage showAlert={showAlert}/>} />
              <Route exact path = '/transactions' element={<TransactionsPage showAlert={showAlert}/>} />
              <Route exact path = '/watchlist' element={<WatchListPage showAlert={showAlert}/>} />
              
              {/* 5. Pass the fetched user state here */}
              <Route exact path = '/chat' element={<ChatPage showAlert={showAlert} user={user} />} />
              
              <Route path="portfolio/:userId" element={<PortfolioPage showAlert={showAlert} />} />
              <Route path="/account" element={<AccountPage showAlert={showAlert}/>} />
              <Route path="*" element={<div>404 Not Found</div>} /> 
            </Routes>
          </div>
        </Router>
    </div>
  );
}

export default App;