import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Home from "./components/landing/Home";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";
import Alert from "./components/Alert";

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
            </Routes>
          </div>
        </Router>
    </div>
  );
}

export default App;