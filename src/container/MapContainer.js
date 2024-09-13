import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material'; // Box와 Button을 @mui/material에서 임포트
import KakaoMap from './map/KakaoMap';
import SearchPlace from './components/Search';
import { MapProvider } from './map/MapContext';
import Header from './components/Header';
import ParkingLotLayer from './components/ParkingLotLayer';
import IllegalParkingLayer from './components/IllegalParking';
import ChildrenAreaLayer from './components/ChildrenAreaLayers';
import FirePlugLayer from './components/FirePugLayer'; // Add this import
import './css/MapContainer.css'
import IncheonIllegalParkingLayer from './components/IncheonIllegalParkingLayer';
import View from './components/View';

export default function MapContainer({ setParkingLots }) {
  // 여러 상태들을 정의합니다.
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [parkingLots, setLocalParkingLots] = useState([]);
  const [illegalParkingData, setIllegalParkingData] = useState([]);
  const [childrenAreaData, setChildrenAreaData] = useState([]);
  const [firePlugData, setFirePlugData] = useState([]); // Add state for fire plug data
  const [incheonIllegalParkingData, setIncheonIllegalParkingData] = useState([]); // Add state for incheon illegal parking data

  useEffect(() => {
    // 여러 데이터를 비동기적으로 가져옵니다.
    const fetchData = async () => {
      try {
        // 여러 API 엔드포인트에서 데이터를 동시에 가져옵니다.
        const [parkingResponse, illegalParkingResponse, childrenAreaResponse, firePlugResponse, incheonIllegalParkingResponse] = await Promise.all([
          fetch('http://localhost:3000/parking-lots'),
          fetch('http://localhost:3000/illegal-parking'),
          fetch('http://localhost:3000/children-area'),
          fetch('http://localhost:3000/fire-plug'),
          fetch('http://localhost:3000/incheon-illegal-parking')
        ]);

        // 응답을 JSON으로 파싱합니다.
        const parkingData = await parkingResponse.json();
        const illegalParkingData = await illegalParkingResponse.json();
        const childrenAreaData = await childrenAreaResponse.json();
        const firePlugData = await firePlugResponse.json();
        const incheonIllegalParkingData = await incheonIllegalParkingResponse.json();

        // 파싱된 데이터를 상태에 설정합니다.
        setLocalParkingLots(parkingData);
        setParkingLots(parkingData); // App.js의 parkingLots 상태 업데이트
        setIllegalParkingData(Array.isArray(illegalParkingData) ? illegalParkingData : []);
        setChildrenAreaData(Array.isArray(childrenAreaData) ? childrenAreaData : []);
        setFirePlugData(Array.isArray(firePlugData) ? firePlugData : []);
        setIncheonIllegalParkingData(Array.isArray(incheonIllegalParkingData) ? incheonIllegalParkingData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [setParkingLots]);

  useEffect(() => {
    // 현재 위치를 가져오는 함수입니다.
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
          },
          () => {
            setCurrentLocation({ lat: 37.5665, lng: 126.978 });
          }
        );
      } else {
        setCurrentLocation({ lat: 37.5665, lng: 126.978 });
      }
    };

    getCurrentLocation();
  }, []);

  // 지도의 중심 위치를 결정합니다.
  const center = searchLocation || currentLocation || { lat: 37.5665, lng: 126.978 };

  useEffect(() => {
    console.log('Search location updated:', searchLocation);
  }, [searchLocation]);

  return (
    <div className="map-container"> {/* Add a wrapper div with a class */}
      <Header />
      <MapProvider>
        <SearchPlace onLocationChange={setSearchLocation} /> {/* onLocationChange 콜백 전달 */}
        <KakaoMap
          center={center}
          markers={[{ title: '현재 위치', position: center }]}
          options={{ level: 3 }}
        />
        <ParkingLotLayer parkingLots={parkingLots} />
        {/* <IllegalParkingLayer illegalParkingData={illegalParkingData} />
        <ChildrenAreaLayer childrenAreaData={childrenAreaData} />
        <FirePlugLayer firePlugData={firePlugData} /> Add FirePlugLayer */}
        <IncheonIllegalParkingLayer incheonIllegalParkingData={incheonIllegalParkingData} />
      </MapProvider>
      <Box display="flex" justifyContent="center" marginTop="16px">
        <Link to="/register-parking-lot">
          <Button variant="contained" color="primary">내 주차장 등록하기</Button>
        </Link>
      </Box>
    </div>
  );
}