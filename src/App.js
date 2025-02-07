import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Signup from "./components/Signup";
import Login from "./components/Login";

function App() {
  return (
    <>
        <Router>
          <NavBar />
          <div className="container">
            <Routes>
              {/* <Route exact path="/" element={<Home/>} /> */}
              {/* <Route exact path="/about" element={<About />} /> */}
              <Route exact path="/login" element={<Login/>} />
              <Route exact path="/signup" element={<Signup/>} />
            </Routes>
          </div>
        </Router>
    </>
  );
}

export default App;