
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
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  
  return (
    <div className="App">
      <Router>

        <Routes>
          <Route path="/" element={<Starter />} />
          <Route path="/Home" element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/Marketplace" element={
            <>
              <Header />
              <Marketplace />
              <Footer />
            </>
          } />
          <Route path="/Store" element={
            <>
              <Header />
              <Store />
              <Footer />
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
            </>
          } />
          <Route path="/Leaderboard" element={
            <>
              <Header />
              <Leaderboard />
              <Footer />
            </>
          } />
          
        </Routes>

      </Router> 
      {/* <Test /> */}
    </div>
  );
}

export default App;