import { useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/home.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import WeaponList from './components/weaponList.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weapons" element={<WeaponList />} />
      </Routes>
    </Router>
  );
}

export default App;
