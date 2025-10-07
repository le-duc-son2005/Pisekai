import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import '../style/Home.css';
import {  features, topPlayers } from '../share/data.js';
import { GiBottomRight3dArrow } from "react-icons/gi";
import { useIntersectionObserver } from '../Utils.js';
const Home = () => {
    const [containerRef, isRevealed] = useIntersectionObserver();
    const navigate = useNavigate();
    return (
        <Container fluid className="homee-container">
            <Row className="align-items-center introduction-section">
                <Col md={6} className='text-center text-md-start mb-4 mb-md-0 align-self-start'>
                    <h1 className='game-title'>PiseKai</h1>
                    <p className="game-description">
                        Game description goes here...
                        Add a short intro about the story or gameplay.
                        Khám phá thế giới pixel đầy màu sắc với những cuộc phiêu lưu hấp dẫn! Hãy sẵn sàng để chiến đấu, thu thập và trở thành huyền thoại trong Pixel Adventure.
                    </p>
                    <div className='d-flex justify-content-center justify-content-md-start gap-3'>
                        <Button className="rounded-pill px-4 fw-bold play-btn">PLAY ON WEB</Button>
                        <Button className="rounded-pill px-4 fw-bold download-btn">DOWNLOAD</Button>
                    </div>
                </Col>
                <Col md={6} className='d-flex justify-content-center'>
                    <div className="image-box d-flex justify-content-center align-items-center">
                        <img
                            src={require('../asserts/Bg-home.jpg')}
                            alt="Game Illustration"
                            className="home-image"
                        />
                    </div>
                </Col>
            </Row>

            <Row className="text-center mt-5 features-section">
                {features.map((feature, index) => (
                    <Col key={index} md={3} className="mb-4">
                        <Card className="h-100 feature-card "
                            onClick={() => navigate(feature.path)}
                            style={{ cursor: 'pointer' }}>
                            <Card.Img variant='top' src={feature.img} className="feature-image mx-auto mt-3" />
                            <Card.Body>
                                <Card.Title className='feature-title'>{feature.title}</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="justify-content-center align-items-end leaderboard-mini-form-section">
                <Row className="justify-content-center">
                    <h2 className="section-title">TOP PLAYERS</h2>
                </Row>
                <div
                    className={`card-stack-container ${isRevealed ? 'revealed' : ''}`}
                    ref={containerRef} // Gắn ref từ hook vào
                >
                    {topPlayers.map((player, index) => (
                        <div key={player.id} className="player-card-wrapper" data-rank={index + 1}>
                            <div className="player-card">
                                <img src={player.image} alt={player.name} />
                                <div className="player-info">
                                    <span className="player-rank"> #{index + 1}</span>
                                    <span className="player-name">{player.name}</span>
                                </div>
                                <div className="player-score">{player.score}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Row>

            <Row className="justify-content-center align-items-center market-mini-form-section">
                <Col md={4}>
                    <img src={require('../asserts/blackMarket.png')}
                        alt="Market"
                        className='market-mini-form-icon mb-2'
                    />
                </Col>
                <Col md={5}>
                    <h3 className="text-white market-banner-title">Welcome to Black Market</h3>
                    <p className="text-white-50">
                        Đây là nơi bạn có thể mua bán vũ khí hiếm, trang bị đặc biệt và các vật phẩm độc nhất.
                        Khám phá ngay hôm nay!
                    </p>
                </Col>

                <Col md={3} className="text-center mb-5 mt-auto">
                    <Button className="trans-market-page-btn fw-bold ">
                        Go to Market <GiBottomRight3dArrow />
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}
export default Home;