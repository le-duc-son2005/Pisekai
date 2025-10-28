import React, { useContext } from 'react';
import { weapons } from '../share/data.js';
import { autoChangeRarityColor } from '../Utils.js';
import { Container, Row, Col, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/weaponList.css';
import { AuthContext } from "../context/AuthContext";

const WeaponList = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="weapon-page">
                <Container className="my-5 text-center inven-title">
                    <h4 className="mb-4">Please login to view Inventory</h4>
                    <div className="d-flex justify-content-center">
                        <button
                            className="auth-open-btn"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-panel', { detail: { tab: 'login' } }));
                            }}
                        >
                            Login / Register
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="weapon-page">
            <Container className="my-4">
                {/* <h3 className="text-center mb-5 titleAll">──── Weapons ────</h3> */}
                <Row className="g-3">
                    {weapons.map((weapon) => (
                        <Col xs={12} md={6} lg={3} key={weapon.id}>
                            <Card className="weapon-element h-100 shadow-sm">
                                <Card.Img variant="top" src={weapon.image} className="weapon-element-img-top" alt={weapon.name} />
                                <Card.Body className="weapon-element-body">
                                    <Card.Title className="weapon-element-title">{weapon.name}</Card.Title>
                                    <Card.Text className="weapon-element-text">
                                        <strong>Type: </strong> <span className="text-detail">{weapon.type}</span> <br />
                                        <strong>Origin: </strong> <span className="text-detail">{weapon.origin}</span><br />
                                        <strong>Description: </strong> <span className="text-detail">{weapon.description}</span> <br />
                                        <strong>Rarity: </strong>
                                        <span className="pros-rarity" style={{ color: autoChangeRarityColor(weapon.rarity), fontWeight: 700 }}>
                                            {weapon.rarity}
                                        </span>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};


export default WeaponList;