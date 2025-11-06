
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Starter from './components/Starter.jsx';
import WeaponList from './components/WeaponList.jsx';
import Header from './components/Header.jsx';
import Marketplace from './components/Marketplace.jsx';
import CharacterPage from './components/CharacterPage.jsx';
import Store from './components/Store.jsx';
import Leaderboard from './components/LeaderBoard.jsx';
import Home from './components/Home.jsx';
import Footer from './components/Footer.jsx';
import { AuthProvider } from "./context/AuthContext";
import GlobalPanel from './components/GlobalPanel.jsx';
import Recharge from './components/recharge/Recharge.jsx';
import RechargeSuccess from './components/recharge/recharge-success.jsx';
import RechargeFail from './components/recharge/recharge-fail.jsx';

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
              <CharacterPage />
              <Footer />
              <GlobalPanel />
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
          <Route path="/recharge" element={<Recharge />} />
          <Route path="/recharge-success" element={<RechargeSuccess />} />
          <Route path="/recharge-fail" element={<RechargeFail />} />
          
        </Routes>
      </Router> 
      </AuthProvider>  
      
    </div>
  );
}

export default App;