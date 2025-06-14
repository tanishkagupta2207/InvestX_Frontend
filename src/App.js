import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./components/Home/Home";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";
import Alert from "./components/Alert";
import Dashboard from "./components/landing/Dashboard";
import TradePage from "./components/pages/TradePage";
import BuySellPage from "./components/pages/BuySellPage";

function App() {

  const [alert, setAlert] = useState(null);
  const showAlert = (message, type)=>{
    setAlert({
      msg: message,
      type: type
    })
    setTimeout(() => {
        setAlert(null);
    }, 1500);
}

  return (
    <div style={{'backgroundColor': '#000'}}>
        <Router>
        <Alert alert={alert}/>
          <div >
            <Routes>
              <Route exact path="/" element={<Home/>} />
              {/* <Route exact path="/about" element={<About />} /> */}
              <Route exact path="/login" element={<Login showAlert={showAlert}/>} />
              <Route exact path="/signup" element={<Signup showAlert={showAlert}/>} />
              <Route exact path="/dashboard" element={<Dashboard showAlert={showAlert}/>} />
              <Route exact path="/trade" element={<TradePage showAlert={showAlert}/>} />
              <Route exact path="/trade/action" element={<BuySellPage showAlert={showAlert}/>} />
            </Routes>
          </div>
        </Router>
    </div>
  );
}

export default App;