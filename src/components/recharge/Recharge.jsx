import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "../../style/recharge.css";
import { IoCaretBack } from "react-icons/io5";
import { FaGem } from "react-icons/fa";

const numberFmt = new Intl.NumberFormat("vi-VN");

const RechargePage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/recharge/packs");
        setPacks(data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Không tải được gói nạp");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBuy = async (packId) => {
    try {
      const { data } = await API.post("/recharge/create", { packId });
      console.log('createRechargeOrder response', data);
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('createRechargeOrder error', err?.response || err);
      alert(err?.response?.data?.message || "Không thể tạo thanh toán!");
    }
  };

  return (
    <div className="recharge-page">
      <button className="back-btn" onClick={() => navigate("/home")} aria-label="Quay về Home">
        <IoCaretBack /> Back
      </button>

      {error && <div className="recharge-error">{error}</div>}

      <div className="pack-grid">
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          packs.map((p) => (
            <button key={p._id} className="pack-card" onClick={() => handleBuy(p._id)}>
              <div className="pack-image">
                {p.image ? (
                  <img src={p.image} alt={`Pack ${p.gems}`} />
                ) : (
                  <div className="img-placeholder" />
                )}
              </div>
              <div className="pack-info">
                <div className="pack-price">{numberFmt.format(p.price)}đ</div>
                <div className="pack-gems">
                  {p.gems} <FaGem />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RechargePage;
