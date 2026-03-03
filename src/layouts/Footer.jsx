import { Container } from "react-bootstrap";
import "../style/Footer.css";

const Footer = () => {
  return (
    <Container fluid as="footer" className="footer-bar text-center py-4 ">
      <span className="footer-text">© 2025 PiSekai (demo)</span>
    </Container>
  );
};

export default Footer;
