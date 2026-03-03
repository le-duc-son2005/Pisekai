    import React, { useContext, useMemo, useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Image } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import RequireLogin from "../subsystem/auth/RequireLogin.jsx";
import { autoChangeRarityColor } from "../Utils.js";
import "../style/weaponList.css";
import "../style/store.css";
import API from "../api/api";
import { FaCoins } from "react-icons/fa";
import { FaGem } from "react-icons/fa";
import SearchFilterBar from "../common/SearchFilterBar.jsx";
import PaginationBar from "../common/Pagination.jsx";
import { useStoreQuery } from "../page/store/hook/useStoreQuery";
import { IoMdAdd } from "react-icons/io";
import { BiMinus } from "react-icons/bi";


const Store = () => {
    const { user } = useContext(AuthContext);
    const {
        q: query,
        setQ: setQuery,
        rarity,
        setRarity,
        sort,
        setSort,
        page,
        setPage,
        limit: pageSize,
        data: items,
        total,
        loading,
        error,
    } = useStoreQuery({ q: "", rarity: "All", sort: "price-asc", page: 1, limit: 8 });
    // Modal purchase state
    const [showPurchase, setShowPurchase] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // { id, price, weapon }
    const [modalQty, setModalQty] = useState(1);

    // Fetching is handled inside useStoreQuery

    const filtered = useMemo(() => {
        // Items are already paginated from server
        return Array.isArray(items) ? items : [];
    }, [items]);

    const openPurchase = (item) => {
        setSelectedItem(item);
        setModalQty(1);
        setShowPurchase(true);
    };

    const closePurchase = () => setShowPurchase(false);
    const incModal = () => setModalQty((q) => Math.max(1, q + 1));
    const decModal = () => setModalQty((q) => Math.max(1, q - 1));
    const confirmBuy = () => {
        if (!selectedItem) return;
        const total = selectedItem.price * modalQty;
        alert(`Đã mua ${modalQty} món. Tổng: ${total.toLocaleString("vi-VN")} VND (giả lập)`);
        setShowPurchase(false);
    };

    // Gate render after hooks to satisfy React hooks rules
    if (!user) {
        return <RequireLogin title="Please login to view Store" />;
    }

    return (
        <div className="store-page">
            <Container className="py-4">
                <h1 className="market-title">Store</h1>

                {/* Toolbar (reusable) */}
                <SearchFilterBar
                    className="market-toolbar"
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Tìm kiếm: tên, loại, ..."
                    rarity={rarity}
                    onRarityChange={setRarity}
                    sort={sort}
                    onSortChange={setSort}
                />

                {/* Grid */}
                <Row className="g-3 mt-2">
                    {filtered.length === 0 && (
                        <Col xs={12} className="text-center text-muted py-5">
                            Không tìm thấy sản phẩm phù hợp.
                        </Col>
                    )}

                    {filtered.map((it) => {
                        const id = it._id || it.id;
                        const name = it.name;
                        const type = it.type;
                        const description = it.description;
                        const rarityVal = (it.rarity || "").replace(/^\w/, (c) => c.toUpperCase());
                        const rarityLower = (it.rarity || "").toLowerCase();
                        const img = it.image && it.image.length ? it.image : "/image/avatar/avatar-0.jpg";
                        const priceGold = it.priceGold || 0;
                        const priceGem = it.priceGem || 0;
                        const isGold = priceGold > 0 || priceGem === 0;
                        const unitPrice = isGold ? priceGold : priceGem;
                        const currencyLabel = isGold ? "Gold" : "Gem";
                        return (
                            <Col xs={12} sm={6} md={4} lg={3} key={id}>
                                <Card className="weapon-element h-100 shadow-sm">
                                    <div className="market-card-img-wrap">
                                        <Card.Img
                                            variant="top"
                                            src={img}
                                            alt={name}
                                            className="weapon-element-img-top"
                                        />
                                    </div>
                                    <Card.Body className="weapon-element-body d-flex flex-column">
                                        <Card.Title className="weapon-element-title mb-1">{name}</Card.Title>
                                        <Card.Text className="weapon-element-text mb-2">
                                            <strong>Type: </strong>
                                            <span className="text-detail">{type}</span> <br />
                                            <strong>Description: </strong>
                                            <span className="text-detail store-desc">{description}</span> <br />
                                            <strong>Rarity: </strong>
                                            <span
                                                className="pros-rarity"
                                                style={{ color: autoChangeRarityColor(rarityVal), fontWeight: 700 }}
                                            >
                                                {rarityVal}
                                            </span>
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer className="border-0 pt-0 pb-3 px-3 store-card-footer">
                                        <Button
                                            variant="dark"
                                            className="w-100 market-buy-btn"
                                            onClick={() =>
                                                openPurchase({
                                                    id,
                                                    price: unitPrice,
                                                    currency: currencyLabel,
                                                    weapon: { name, image: img, rarity: rarityLower },
                                                })
                                            }
                                        >
                                            Purchase
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Pagination at bottom, centered */}
                <div className="mt-3 mb-3">
                    <PaginationBar
                        compact
                        align="center"
                        className="store-pagination"
                        total={total}
                        page={page}
                        pageSize={pageSize}
                        onChange={(p) => setPage(p)}
                    />
                </div>

                {/* Purchase Modal */}
                <Modal show={showPurchase} onHide={closePurchase} centered className="purchase-modal">
                    {selectedItem && (
                        <>
                            <Modal.Header closeButton className="pm-header">
                                <Modal.Title className="pm-title text-center w-100">Order</Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="pm-body">
                                <div className={`pm-item rarity-${(selectedItem.weapon.rarity || '').toLowerCase()}` }>
                                    <Image src={selectedItem.weapon.image} alt={selectedItem.weapon.name} className="pm-image" />
                                    <div className="flex-grow-1">
                                        <div className="pm-name">{selectedItem.weapon.name}</div>
                                        <div className="pm-desc">{selectedItem.description}</div>
                                    </div>
                                </div>

                                <div className="pm-section mt-3">
                                    <div className="pm-section-title">Amount</div>
                                    <InputGroup className="pm-qty">
                                        <Button className="pm-circle-btn" variant="outline-light" onClick={decModal}><BiMinus/></Button>
                                        <Form.Control value={modalQty} readOnly className="text-center pm-qty-input" />
                                        <Button className="pm-circle-btn" variant="outline-light" onClick={incModal}><IoMdAdd/></Button>
                                    </InputGroup>
                                    <div className="pm-qty-glow" />
                                </div>

                                <div className="pm-total mt-3 text-center">
                                    <div className="pm-total-label">Total</div>
                                    <div className={`pm-total-value ${selectedItem.currency === 'Gem' ? 'gem' : 'gold'}`}>
                                        {(selectedItem.price * modalQty).toLocaleString("vi-VN")}
                                        <span className="ms-2">{selectedItem.currency === 'Gem' ? <FaGem/> : <FaCoins/>}</span>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer className="pm-footer">
                                <Button className="pm-cancel-btn" variant="secondary" onClick={closePurchase}>Cancel</Button>
                                <Button className="pm-buy-btn" variant="dark" onClick={confirmBuy}>Buy</Button>
                            </Modal.Footer>
                        </>
                    )}
                </Modal>
            </Container>
        </div>
    );
};

export default Store;