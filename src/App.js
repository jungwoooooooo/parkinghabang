import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MapContainer from './container/MapContainer';
import ParkingLotDetail from './pages/ParkingLotDetail';
import Reservation from './pages/Reservation';
import RegisterParkingLot from './pages/RegisterParkingLot';

const App = () => {
  // 로그인 상태와 주차장 목록을 관리하는 상태를 생성합니다.
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [parkingLots, setParkingLots] = React.useState([]);

  return (
    // 라우터를 설정하여 각 경로에 대한 컴포넌트를 지정합니다.
    <Router>
      <Routes>
        {/* 로그인 페이지 라우트 */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={() => setIsLoggedIn(true)} />} />
        {/* 주차장 상세 정보 페이지 라우트 */}
        <Route path="/parking-lot/:id" element={<ParkingLotDetail parkingLots={parkingLots} />} />
        {/* 예약 페이지 라우트 */}
        <Route path="/reservation" element={<Reservation parkingLots={parkingLots} />} />
        {/* 주차장 등록 페이지 라우트 */}
        <Route path="/register-parking-lot" element={<RegisterParkingLot />} />
        {/* 메인 페이지 라우트 (로그인 여부에 따라 다른 컴포넌트 렌더링) */}
        <Route path="/" element={isLoggedIn ? <MapContainer setParkingLots={setParkingLots} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;