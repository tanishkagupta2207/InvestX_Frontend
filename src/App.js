import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import '@flaticon/flaticon-uicons/css/regular/rounded.css'; 
import Home from "./components/Home/Home";
import About from "./components/Home/About";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";
import Alert from "./components/Alert";
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

function App() {

  const [alert, setAlert] = useState(null);
  const showAlert = (message, type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
        setAlert(null);
    }, 3000);
}

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
              <Route exact path="/login" element={<Login showAlert={showAlert}/>} />
              <Route exact path="/signup" element={<Signup showAlert={showAlert}/>} />
              <Route exact path="/dashboard" element={<Dashboard showAlert={showAlert}/>} />
              <Route exact path="/stocks" element={<TradePage showAlert={showAlert}/>} />
              <Route exact path="/trade/action" element={<BuySellPage showAlert={showAlert}/>} />
              <Route exact path="/mutualfunds" element={<MutualFundPage showAlert={showAlert}/>} />
              <Route exact path = '/orders' element={<OrderPage showAlert={showAlert}/>} />
              <Route exact path = '/transactions' element={<TransactionsPage showAlert={showAlert}/>} />
              <Route exact path = '/watchlist' element={<WatchListPage showAlert={showAlert}/>} />
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