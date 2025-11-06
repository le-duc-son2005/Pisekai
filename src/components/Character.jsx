import { useState, useContext } from "react";
import { characters } from "../share/data.js";
import { Container, Row, Col, Button, ProgressBar, Form } from "react-bootstrap";
import { getStatVariant } from "../Utils.js"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

import '../style/Character.css'

const Character = ({ show, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentChar = characters[currentIndex];
    const [saving, setSaving] = useState(false);
    const { login } = useContext(AuthContext);

    const prevChar = () => {
        setCurrentIndex((prev) => (prev === 0 ? characters.length - 1 : prev - 1));
    };

    const nextChar = () => {
        setCurrentIndex((prev) => (prev === characters.length - 1 ? 0 : prev + 1));
    };

    const handleEnterGame = async () => {
        if (saving) return;
        try {
            setSaving(true);
            // Send only class; backend derives stats and persists
            await API.post("/characters/select", { class: currentChar.name });
            // Refresh current user to get updated characterId
            const { data } = await API.get("/auth/me");
            login(data); // update context + localStorage
            onClose?.();
        } catch (err) {
            console.error("Select character failed:", err?.response?.data || err.message);
            alert(err?.response?.data?.message || "Không thể chọn nhân vật. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="character-overlay">
            <Button className="close-btn" onClick={onClose}>
                <MdClose/>
            </Button>

            <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center text-light ">
                <Row className="w-100 character-slider  justify-content-center align-items-center">

                    <Col xs="auto">
                        <Button variant="dark" onClick={prevChar} className="arrow-btn left-arrow">
                            <FaAngleLeft size={32} />
                        </Button>
                    </Col>

                    <Col xs={10} md={6} className="text-center position-relative">
                        <div className="character-slide">
                            <img
                                src={currentChar.img}
                                alt={currentChar.name}
                                className="img-fluid rounded-4"
                                style={{
                                    maxHeight: "250px",
                                    objectFit: "contain",
                                    transition: "transform 0.5s ease, opacity 0.5s ease"
                                }}
                            />
                            
                        </div>
                    </Col>

                    <Col xs={11} md={5}>
                        <div className="character-info p-4 rounded-4 shadow-lg">
                            <h3 className="mb-3">{currentChar.name}</h3>


                            <div className="mb-2">HP</div>
                            <ProgressBar now={currentChar.stats.HP} label={`${currentChar.stats.HP}`} variant={getStatVariant(currentChar.stats.HP)} className="mb-2" />
                            <div className="mb-2">SPEED</div>
                            <ProgressBar now={currentChar.stats.SPEED} label={`${currentChar.stats.SPEED}`} variant={getStatVariant(currentChar.stats.SPEED)} className="mb-2" />
                            <div className="mb-2">DAMAGE</div>
                            <ProgressBar now={currentChar.stats.DAMAGE} label={`${currentChar.stats.DAMAGE}`} variant={getStatVariant(currentChar.stats.DAMAGE)} className="mb-2" />
                            <div className="mb-2">ARMOR</div>
                            <ProgressBar now={currentChar.stats.ARMOR} label={`${currentChar.stats.ARMOR}`} variant={getStatVariant(currentChar.stats.ARMOR)} className="mb-3" />

                            <div className="fw-bold mb-3">Buff: <span className="text-info">{currentChar.buff}</span></div>

                            <div className="d-flex  align-items-center">
                                <Button className="px-4 ms-auto enter-btn fw-bold" onClick={handleEnterGame} disabled={saving}>
                                    {saving ? "Saving..." : "Enter Game"}
                                </Button>  
                            </div>
                        </div>
                    </Col>

                    <Col xs="auto">
                        <Button variant="dark" onClick={nextChar} className="arrow-btn right-arrow">
                            <FaAngleRight size={32} />
                        </Button>
                    </Col>

                </Row>
                
            </Container>
        </div>
    );
}
export default Character; 