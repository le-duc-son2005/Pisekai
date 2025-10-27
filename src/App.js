
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Starter from './components/Starter.jsx';
import WeaponList from './components/WeaponList.jsx';
import Header from './components/Header.jsx';
import Marketplace from './components/Marketplace.jsx';
import Character from './components/Character.jsx';
import Store from './components/Store.jsx';
import Leaderboard from './components/LeaderBoard.jsx';
import Home from './components/Home.jsx';
import Footer from './components/Footer.jsx';
import { AuthProvider } from "./context/AuthContext";
import GlobalPanel from './components/GlobalPanel.jsx';

function App() {
  
  return (
    <div className="App">
      <AuthProvider>  
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Starter />
              
            </>
          } />
          <Route path="/Home" element={
            <>
              <Header />
              <Home />
              <Footer />
              <GlobalPanel />
            </>
          } />
          <Route path="/Marketplace" element={
            <>
              <Header />
              <Marketplace />
              <Footer />
              <GlobalPanel />
            </>
          } />
          <Route path="/Store" element={
            <>
              <Header />
              <Store />
              <Footer />
              <GlobalPanel />
            </>
          } />
          <Route path="/Character" element={
            <>
              <Header />
              <Character />
              <Footer />
            </>
          } />
          <Route path="/WeaponList" element={
            <>
              <Header />
              <WeaponList />
              <Footer />
              <GlobalPanel />
            </>
          } />
          <Route path="/Leaderboard" element={
            <>
              <Header />
              <Leaderboard />
              <Footer />
              <GlobalPanel />
            </>
          } />
          
        </Routes>
      </Router> 
      </AuthProvider>  
      {/* <Test /> */}
    </div>
  );
}

export default App;