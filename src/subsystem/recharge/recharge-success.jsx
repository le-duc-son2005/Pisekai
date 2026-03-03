import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import API from "../../api/api";

const RechargeSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderCode: stateOrderCode } = (location && location.state) || {};
  const query = new URLSearchParams(location.search);
  const orderCodeFromQuery = query.get("orderCode");
  const [statusMsg, setStatusMsg] = useState("Đang xử lý...");
  const [gemsAdded, setGemsAdded] = useState(0);
  const [orderCode, setOrderCode] = useState(stateOrderCode || orderCodeFromQuery);
  const calledRef = React.useRef(false);

  useEffect(() => {
    if (!orderCode) {
      setStatusMsg("Không tìm thấy đơn hàng");
      return;
    }

    const confirm = async () => {
      if (calledRef.current) return; // avoid double submit (StrictMode or multiple renders)
      calledRef.current = true;
      try {
        setStatusMsg("Xác nhận đơn...");
        const { data } = await API.post("/recharge/confirm", { orderCode });
        if (data.added) {
          setGemsAdded(data.gems || 0);
          setStatusMsg("Thanh toán thành công!");
        } else {
          setStatusMsg(data.message || "Đã xử lý");
        }
      } catch (err) {
        console.error(err);
        setStatusMsg(err?.response?.data?.message || "Lỗi khi xác nhận đơn");
      }
    };

    confirm();
  }, [orderCode]);

  return (
    <div className="result-page">
      <div className="result-card success">
        <div className="result-icon success-icon"><FaRegCheckCircle /></div>
        <h2 className="result-title">Thanh toán thành công</h2>
        

        {orderCode && <div className="order-code">Mã đơn: <strong>{orderCode}</strong></div>}
        {gemsAdded > 0 && <div className="result-note">Bạn đã được cộng thành công <strong>{gemsAdded} GEM vào tài khoản</strong></div>}

        <div className="result-actions">
          <button className="homeBack-btn" onClick={() => navigate("/Home")}>Về trang chủ</button>
        </div>
      </div>
    </div>
  );
};

export default RechargeSuccess;
