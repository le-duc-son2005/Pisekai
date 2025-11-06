import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TfiAlert } from "react-icons/tfi";
import API from "../../api/api";

const RechargeFail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reason, orderCode: stateOrderCode } = (location && location.state) || {};
  const [busy, setBusy] = useState(false);
  // read orderCode either from location.state or from query param
  const query = new URLSearchParams(location.search);
  const orderCode = stateOrderCode || query.get("orderCode");

  useEffect(() => {
    // prefer orderCode passed in location.state; otherwise read from URL query param
    const query = new URLSearchParams(location.search);
    const code = stateOrderCode || query.get("orderCode");
    if (!code) return;

    const markCancel = async () => {
      try {
        setBusy(true);
        await API.post("/recharge/cancel", { orderCode: code });
      } catch (err) {
        // ignore – best effort
        console.warn("cancel order failed", err?.response?.data || err.message);
      } finally {
        setBusy(false);
      }
    };

    markCancel();
  }, [stateOrderCode, location.search]);

  return (
    <div className="result-page">
      <div className="result-card fail">
        <div className="result-icon"><TfiAlert/></div>
        <h2 className="result-title">Thanh toán không thành công</h2>
        <p className="result-message">Giao dịch chưa hoàn tất. Vui lòng thử lại.</p>

        {reason && <div className="result-note">Lý do: {reason}</div>}
        {orderCode && <div className="order-code">Mã đơn: <strong>{orderCode}</strong></div>}

        <div className="result-actions">
          <button className="homeBack-btn" onClick={() => navigate("/Home")}>Về trang chủ</button>
        </div>
      </div>
    </div>
  );
};

export default RechargeFail;