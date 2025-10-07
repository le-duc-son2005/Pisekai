import { Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import '../style/Header.css';

const Header = () => {
    return (
        <>
            <Navbar expand="lg" className='header' bg-light>
                <Container className="d-flex justify-content-center align-items-center header-container">
                    <Nav className='gap-5 pb-3 header-title'>
                        <Nav.Link as={Link} to="/Home">Home</Nav.Link>
                        <Nav.Link as={Link} to="/Character">Character</Nav.Link>
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