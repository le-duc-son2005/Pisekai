import { useMemo, useState, useContext } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { autoChangeRarityColor } from "../../../Utils.js";
import "../../Inventory/style/weaponList.css"; // reuse inventory card styles
import "../style/Market.css";
import { AuthContext } from "../../../context/AuthContext.js";
import RequireLogin from "../../../subsystem/auth/RequireLogin.jsx";
import SearchFilterBar from "../../../components/common/SearchFilterBar.jsx";
import useMarket from "../hook/useMarket";

const Marketplace = () => {
    const { user } = useContext(AuthContext);
    const [query, setQuery] = useState("");
    const [rarity, setRarity] = useState("All");
    const [sort, setSort] = useState("price-asc");
    const [buyMsg, setBuyMsg] = useState(null);

    const { listings, loading, error, buyItem } = useMarket();

    // Normalize listings for consistent access
    const normalized = useMemo(() => listings.map((l) => ({
        id: l._id,
        weapon: l.weaponId || {},
        seller: l.sellerId?.username || "Unknown",
        price: l.price,
    })), [listings]);

    const filtered = useMemo(() => {
        let data = normalized;

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
    }, [normalized, query, rarity, sort]);

    const handleBuy = async (id) => {
        const result = await buyItem(id);
        if (result.success) {
            setBuyMsg({ type: "success", text: "Buy successful!" });
        } else {
            setBuyMsg({ type: "danger", text: result.message });
        }
        setTimeout(() => setBuyMsg(null), 3000);
    };

    if (!user) {
        return <RequireLogin title="Please login to view Marketplace" />;
    }

    return (
        <div className="market-page">
            <Container className="py-4">
                <h1 className="market-title">Black Market</h1>

                <SearchFilterBar
                    className="market-toolbar"
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Tìm kiếm: tên, loại, nguồn gốc, người bán..."
                    rarity={rarity}
                    onRarityChange={setRarity}
                    sort={sort}
                    onSortChange={setSort}
                />

                {buyMsg && (
                    <Alert variant={buyMsg.type} className="mt-3" dismissible onClose={() => setBuyMsg(null)}>
                        {buyMsg.text}
                    </Alert>
                )}

                {loading && (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="warning" />
                    </div>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                {/* Grid */}
                {!loading && !error && (
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
                                    >
                                        Purchase
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
                )}
            </Container>
        </div>
    );
};

export default Marketplace;