import React ,{ createContext, useState }from "react";
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import '../style/Header.css';
import Character from '../components/Character.jsx';

const Header = () => {
    const [showCharacter, setShowCharacter] = useState(false);
    return (
        <>
            <Navbar expand="lg" className='header' bg-light>
                <Container className="d-flex justify-content-center align-items-center header-container">
                    <Nav className='gap-5 pb-3 header-title'>
                        <Nav.Link as={Link} to="/Home">Home</Nav.Link>
                        <Nav.Link as={Link} to="/Character" onClick={() => setShowCharacter(true)} >Character</Nav.Link>
                        <Character show={showCharacter} onClose={() => setShowCharacter(false)} />
                        <Nav.Link as={Link} to="/Marketplace">Market</Nav.Link>
                    </Nav>
                    <Navbar.Brand as={Link} to="/" className="mx-5">
                        <img
                            src={[require('../asserts/Logo.png')]}
                            alt="Logo"
                            height="120"

                        />
                    </Navbar.Brand>
                    <Nav className='gap-5 pb-3 header-title'>
                        <Nav.Link as={Link} to="/WeaponList">Inventory</Nav.Link>
                        <Nav.Link as={Link} to="/Store">Store</Nav.Link>
                        <Nav.Link as={Link} to="/Leaderboard">Leaderboard</Nav.Link>
                    </Nav>

                </Container>
            </Navbar>
        </>
    )
}
export default Header;