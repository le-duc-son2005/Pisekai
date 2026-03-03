import React, { useContext } from 'react';
import { autoChangeRarityColor } from '../../../Utils.js';
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style/weaponList.css";
import { AuthContext } from "../../../context/AuthContext.js";
import RequireLogin from "../../../subsystem/auth/RequireLogin.jsx";
import { useInventory } from "../hook/useInventory.js";

const WeaponList = () => {
    const { user } = useContext(AuthContext);
    const { items, loading, error } = useInventory();

    if (!user) {
        return <RequireLogin title="Please login to view Inventory" />;
    }

    if (loading) {
        return (
            <div className="weapon-page d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="weapon-page py-5">
                <Alert variant="danger" className="text-center mx-auto" style={{ maxWidth: 480 }}>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="weapon-page">
            <Container className="my-4">
                <Row className="g-3">
                    {items.length === 0 && (
                        <Col xs={12} className="text-center text-muted py-5">
                            Your inventory is empty. Explore the world and acquire new weapons to see them here!
                        </Col>
                    )}
                    {items.map(({ _id, quantity, weapon }) => (
                        <Col xs={12} md={6} lg={3} key={_id}>
                            <Card className="weapon-element h-100 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={weapon.image || "/image/avatar/avatar-0.jpg"}
                                    className="weapon-element-img-top"
                                    alt={weapon.name}
                                />
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
                                        {quantity > 1 && (
                                            <><br /><strong>Quantity: </strong> <span className="text-detail">x{quantity}</span></>
                                        )}
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