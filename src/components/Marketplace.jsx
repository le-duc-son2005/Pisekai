import { useMemo, useState } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import { weapons } from "../share/data.js";
import { autoChangeRarityColor } from "../Utils.js";
import "../style/weaponList.css"; // reuse inventory card styles
import "../style/Market.css";

const MOCK_SELLERS = [
    "Người chơi A",
    "Người chơi B",
    "Người chơi C",
    "Người chơi D",
    "Người chơi E",
];

const Marketplace = () => {
    const [query, setQuery] = useState("");
    const [rarity, setRarity] = useState("All");
    const [sort, setSort] = useState("price-asc");
    const [purchasedIds, setPurchasedIds] = useState(new Set());

    // Mock listings based on weapons data
    const listings = useMemo(() => {
        return weapons.slice(0, 8).map((w, idx) => ({
            id: `mk-${w.id}`,
            weapon: w,
            seller: MOCK_SELLERS[idx % MOCK_SELLERS.length],
            // Simple mock pricing formula; later replace with DB field
            price: 10000 + (w.stats?.atk || 50) * 50 + (w.stats?.magic || 0) * 30,
        }));
    }, []);

    const filtered = useMemo(() => {
        let data = listings;

        if (query.trim()) {
            const q = query.toLowerCase();
            data = data.filter(({ weapon, seller }) =>
                weapon.name.toLowerCase().includes(q) ||
                weapon.type.toLowerCase().includes(q) ||
                (weapon.origin || "").toLowerCase().includes(q) ||
                seller.toLowerCase().includes(q)
            );
        }

        if (rarity !== "All") {
            data = data.filter(({ weapon }) => weapon.rarity === rarity);
        }

        const sorted = [...data];
        switch (sort) {
            case "price-asc":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                sorted.sort((a, b) => a.weapon.name.localeCompare(b.weapon.name));
                break;
            case "name-desc":
                sorted.sort((a, b) => b.weapon.name.localeCompare(a.weapon.name));
                break;
            default:
                break;
        }
        return sorted;
    }, [listings, query, rarity, sort]);

    const handleBuy = (id) => {
        setPurchasedIds((prev) => new Set(prev).add(id));
        // Placeholder; later integrate with API/DB transaction
        // eslint-disable-next-line no-alert
        alert("Mua thành công (giả lập). Sẽ kết nối database sau này.");
    };

    return (
        <div className="market-page">
            <Container className="py-4">
                <h1 className="market-title">Black Market</h1>

                {/* Toolbar */}
                <Row className="gy-3 gx-3 align-items-center market-toolbar">
                    <Col xs={12} md={6} lg={6}>
                        <InputGroup>
                            <Form.Control
                                placeholder="Tìm kiếm: tên, loại, nguồn gốc, người bán..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={6} md={3} lg={3}>
                        <Form.Select value={rarity} onChange={(e) => setRarity(e.target.value)}>
                            <option value="All">Tất cả độ hiếm</option>
                            <option value="Uncommon">Uncommon</option>
                            <option value="Rare">Rare</option>
                            <option value="Epic">Epic</option>
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={3} lg={3}>
                        <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="name-asc">Tên A → Z</option>
                            <option value="name-desc">Tên Z → A</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* Grid */}
                <Row className="g-3 mt-2">
                    {filtered.length === 0 && (
                        <Col xs={12} className="text-center text-muted py-5">
                            Không tìm thấy vật phẩm phù hợp.
                        </Col>
                    )}

                    {filtered.map(({ id, weapon, seller, price }) => (
                        <Col xs={12} sm={6} md={4} lg={3} key={id}>
                            <Card className="weapon-element h-100 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={weapon.image}
                                    alt={weapon.name}
                                    className="weapon-element-img-top"
                                />
                                <Card.Body className="weapon-element-body d-flex flex-column">
                                    <Card.Title className="weapon-element-title mb-1">
                                        {weapon.name}
                                    </Card.Title>
                                    <Card.Text className="weapon-element-text mb-2">
                                        <strong>Type: </strong>
                                        <span className="text-detail">{weapon.type}</span> <br />
                                        <strong>Origin: </strong>
                                        <span className="text-detail">{weapon.origin}</span> <br />
                                        <strong>Description: </strong>
                                        <span className="text-detail">{weapon.description}</span> <br />
                                        <strong>Rarity: </strong>
                                        <span
                                            className="pros-rarity"
                                            style={{ color: autoChangeRarityColor(weapon.rarity), fontWeight: 700 }}
                                        >
                                            {weapon.rarity}
                                        </span>
                                    </Card.Text>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="market-price">{price.toLocaleString("vi-VN")} VND</div>
                                        <div className="market-seller text-muted small">{seller}</div>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-white border-0 pt-0 pb-3 px-3">
                                    <Button
                                        variant="dark"
                                        className="w-100 market-buy-btn"
                                        onClick={() => handleBuy(id)}
                                        disabled={purchasedIds.has(id)}
                                    >
                                        {purchasedIds.has(id) ? "Đã mua" : "Mua ngay"}
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default Marketplace;