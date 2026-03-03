
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Starter from './layouts/Starter.jsx';
import WeaponList from './page/Inventory/components/WeaponList.jsx';
import Header from './layouts/Header.jsx';
import Marketplace from './page/market/components/Marketplace.jsx';
import CharacterPage from './page/character/components/CharacterPage.jsx';
import Store from './page/store/components/Store.jsx';
import Leaderboard from './page/leaderBoard/components/LeaderBoard.jsx';
import Profile from './page/profile/components/Profile.jsx';
import Home from './layouts/Home.jsx';
import Footer from './layouts/Footer.jsx';
import { AuthProvider } from "./context/AuthContext";
import GlobalPanel from './subsystem/panel/GlobalPanel.jsx';
import Recharge from './subsystem/recharge/Recharge.jsx';
import RechargeSuccess from './subsystem/recharge/recharge-success.jsx';
import RechargeFail from './subsystem/recharge/recharge-fail.jsx';

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
          <Route path="/recharge/success" element={<RechargeSuccess />} />
          <Route path="/recharge/fail" element={<RechargeFail />} />
          <Route path="/Profile" element={
            <>
              <Header />
              <Profile />
              <Footer />
              <GlobalPanel />
            </>
          } />
          <Route path="/recharge-success" element={<RechargeSuccess />} />
          <Route path="/recharge-fail" element={<RechargeFail />} />
          
        </Routes>
      </Router> 
      </AuthProvider>  
      
    </div>
  );
}

export default App;