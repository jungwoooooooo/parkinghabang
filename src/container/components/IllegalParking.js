import React, { useEffect, useState } from 'react';
import { useMap } from '../map/MapContext'; // 경로를 필요에 따라 조정하세요

const { kakao } = window;

const IllegalParkingLayer = ({ illegalParkingData }) => {
  const { map } = useMap();
  const [markers, setMarkers] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [isLayerVisible, setIsLayerVisible] = useState(false); // 레이어 표시 여부 상태

  useEffect(() => {
    if (!map || !illegalParkingData) return;

    // 현재 표시된 마커 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    if (!isLayerVisible) return; // 레이어가 비활성화된 경우 아무 것도 하지 않음

    const illegalParkingIconUrl = 'https://cdn-icons-png.flaticon.com/512/4017/4017956.png';

    const newMarkers = illegalParkingData.map(parking => {
      if (parking.lon && parking.lat) {
        const position = new kakao.maps.LatLng(parking.lat, parking.lon);

        const marker = new kakao.maps.Marker({
          position,
          map,
          title: parking.cctv_jibun,
          image: new kakao.maps.MarkerImage(illegalParkingIconUrl, new kakao.maps.Size(32, 32))
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }

          const content = `
            <div>
              <h2>상세정보</h2>
              <h3>${parking.cctv_jibun}</h3>
              <p>카테고리: ${parking.category}</p>
              <p>위치: ${parking.lat}, ${parking.lon}</p>
              <p>구역: ${parking.district}</p>
              <p>단속 지점: ${parking.enforcement_point}</p>
              <p>주차장 유형: ${parking.site_type}</p>
            </div>
          `;

          const infowindow = new kakao.maps.InfoWindow({
            content,
            position: marker.getPosition(),
          });

          infowindow.open(map, marker);
          setActiveInfoWindow(infowindow);

          kakao.maps.event.addListener(map, 'click', () => {
            infowindow.close();
            setActiveInfoWindow(null);
          });
        });

        return marker;
      }
      return null;
    }).filter(marker => marker !== null);

    setMarkers(newMarkers);

    kakao.maps.event.addListener(map, 'click', () => {
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }
    });

  }, [map, illegalParkingData, isLayerVisible]);

  const toggleLayerVisibility = () => {
    setIsLayerVisible(prev => !prev);
  };

  return (
    <>
      <button onClick={toggleLayerVisibility} style={{ position: 'absolute', top: 30, left: 170, zIndex: 1000 }}>
        {isLayerVisible ? '숨기기' : 'cctv 단속 위치 보기'}
      </button>
    </>
  );
};

export default IllegalParkingLayer;
