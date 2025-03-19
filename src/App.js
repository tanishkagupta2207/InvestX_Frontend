import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/landing/Home";
import Signup from "./components/authentication/Signup";
import Login from "./components/authentication/Login";

function App() {
  return (
    <div style={{'backgroundColor': '#000'}}>
        <Router>
          <div style={{'paddingTop': '4rem'}}>
            <Routes>
              <Route exact path="/" element={<Home/>} />
              {/* <Route exact path="/about" element={<About />} /> */}
              <Route exact path="/login" element={<Login/>} />
              <Route exact path="/signup" element={<Signup/>} />
            </Routes>
          </div>
        </Router>
    </div>
  );
}

export default App;