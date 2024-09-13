import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useMap } from '../map/MapContext';
import ParkingLotList from './ParkingLotList';
import { getCarDirection } from './getCarDirection';
import { debounce } from 'lodash';

// 카카오맵 초기화
const { kakao } = window;

// 주차장 레이어 컴포넌트
const ParkingLotLayer = ({ parkingLots }) => {
  // 카카오맵 초기화
  const { map } = useMap();
  // 마커 상태 관리
  const [markers, setMarkers] = useState([]);
  // 활성화된 정보 창 상태 관리
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  // 보이는 주차장 상태 관리
  const [visibleParkingLots, setVisibleParkingLots] = useState([]);
  // 강조된 주차장 상태 관리
  const [highlightedLot, setHighlightedLot] = useState(null);
  // 반경 반지름 상태 관리
  const [radius, setRadius] = useState(800);
  // 지도 중심 상태 관리
  const mapCenterRef = useRef({ lat: 37.5665, lng: 126.9780 });
  // 마커 맵 상태 관리
  const markerMapRef = useRef({});
  // 경로 상태 관리
  const [routePath, setRoutePath] = useState(null);
  // 사용자 위치 상태 관리
  const [userLocation, setUserLocation] = useState(null);
  // 하이라이트 원 상태 관리
  const [highlightCircle, setHighlightCircle] = useState(null);
  // 커스텀 오버레이 상태 관리
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [customOverlay, setCustomOverlay] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  // 클러스터러 상태 관리
  const clustererRef = useRef(null);
  const customOverlaysRef = useRef([]);

  // 정보 창 생성 함수
  const createInfoWindowContent = useCallback((lot) => {
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="padding:5px; background-color:white; border:1px solid black; border-radius:5px;">
        <div><strong>${lot.주차장명}</strong></div>
        <div>요금: ${lot.요금정보}</div>
        <div>기본 요금: ${lot.주차기본요금}</div>
        <div>구분: ${lot.주차장구분}</div>
        <div>운영요일: ${lot.운영요일}</div>
        <div>잔여 수: ${lot.가능한주차면}</div>
      </div>
    `;
    
    const findRouteButton = document.createElement('button');
    findRouteButton.textContent = '경로표시';
    findRouteButton.style.marginTop = '5px';
    findRouteButton.onclick = (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      window.handleFindRoute(lot.id);
    };
    content.querySelector('div').appendChild(findRouteButton);
    
    return content;
  }, []);

  // 주차장 선택 시 처리
  const handleClickListItem = useCallback(async (lot) => {
    const position = new kakao.maps.LatLng(lot.위도, lot.경도);
    map.panTo(position, {
      duration: 1000
    });
  
    if (activeInfoWindow) {
      activeInfoWindow.close();
    }
  
    // 정보 창 생성
    const infowindow = new kakao.maps.InfoWindow({
      content: createInfoWindowContent(lot),
      position: position,
      zIndex: 9999,
    });
  
    // 정보 창 열기
    infowindow.open(map);
    setActiveInfoWindow(infowindow);
  }, [map, activeInfoWindow, createInfoWindowContent]);

  // 길찾기 함수
  // ... existing code ...

const handleFindRoute = useCallback(async (lotId) => {
  const lot = parkingLots.find(l => l.id === lotId);
  if (!lot) return;

  try {
    if (!userLocation) {
      throw new Error("사용자 위치를 가져올 수 없습니다.");
    }

    // 경로 데이터 가져오기
    const routeData = await getCarDirection(
      userLocation,
      { lat: lot.위도, lng: lot.경도 }
    );
    
    console.log('Route data:', JSON.stringify(routeData, null, 2)); // 경로 데이터 로그 추가

    // 기존 경로가 있다면 제거합니다
    if (routePath) {
      routePath.setMap(null);
    }

    // 경로 데이터가 유효하다면 경로 표시
    if (routeData && routeData.routes && routeData.routes.length > 0 && routeData.routes[0].sections) {
      const path = routeData.routes[0].sections.flatMap(section =>
        section.roads.flatMap(road =>
          road.vertexes.reduce((acc, coord, index) => {
            if (index % 2 === 0) {
              acc.push(new kakao.maps.LatLng(road.vertexes[index + 1], coord));
            }
            return acc;
          }, [])
        )
      );

      // 경로 표시
      if (path.length > 0) {
        const polyline = new kakao.maps.Polyline({
          path: path,
          strokeWeight: 5,
          strokeColor: '#424242',
          strokeOpacity: 0.7,
          strokeStyle: 'solid'
        });

        polyline.setMap(map);
        setRoutePath(polyline);
        const bounds = new kakao.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.setBounds(bounds);
      } else {
        console.warn('경로 좌표가 없습니다.');
        alert('경로를 표시할 수 없습니다. 출발지와 도착지가 너무 가깝습니다.');
      }
    } else {
      throw new Error('유효한 경로 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('경로를 가져오는 데 실패했습니다:', error);
    alert(error.message || '경로를 가져오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}, [map, userLocation, routePath]);

// ... existing code ...

  useEffect(() => {
    // 전역 함수로 길찾기 핸들러 추가
    window.handleFindRoute = handleFindRoute;

    return () => {
      // 컴포넌트 언마운트 시 전역 함수 제거
      delete window.handleFindRoute;
    };
  }, [handleFindRoute]);

  const handleRadiusIncrease = useCallback(() => {
    const newRadius = radius + 200;
    setRadius(newRadius);
    const level = calculateZoomLevel(newRadius);
    map.setLevel(level);
    const center = map.getCenter();
    map.setCenter(center);
  }, [radius, map]);

  // 줌 레벨 계산 함수
  const calculateZoomLevel = useCallback((radius) => {
    if (radius <= 500) return 3;
    if (radius <= 1000) return 5;
    if (radius <= 2000) return 6;
    if (radius <= 4000) return 7;
    if (radius <= 8000) return 8;
    return 10;
  }, []);

  // 마커 이미지 생성 함수
  const createMarkerImage = useMemo(() => {
    return (lot, size = 40, isHighlighted = false) => {
      let iconUrl;
      if (isHighlighted) {
        // 하이라이트된 마커용 이미지 (3가지 종류)
        if (lot.요금정보 === '무료') {
          iconUrl = 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%EB%AC%B4%EB%A3%8C_%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8.png?raw=true';
        } else if (lot.요금정보 === '유료') {
          iconUrl = 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%EC%9C%A0%EB%A3%8C_%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8.png?raw=true';
        } else {
          iconUrl = 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%ED%98%BC%ED%95%A9_%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8.png?raw=true';
        }
      } else {
        // 기존 로직
        iconUrl = lot.요금정보 === '무료' 
          ? 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%EB%AC%B4%EB%A3%8C%EC%9D%B4%EB%AF%B8%EC%A7%80.png?raw=true'
          : lot.요금정보 === '유료'
          ? 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%EC%9C%A0%EB%A3%8C%EC%9D%B4%EB%AF%B8%EC%A7%80.png?raw=true'
          : 'https://github.com/jungwoooooooo/parkpark/blob/master/src/assert/%ED%98%BC%ED%95%A9.png?raw=true';
      }

      return new kakao.maps.MarkerImage(
        iconUrl,
        new kakao.maps.Size(size, size),
        { offset: new kakao.maps.Point(size / 2, size / 2) }
      );
    };
  }, []);

  // 마커 강조 업데이트 함수
  const updateMarkerHighlight = useCallback((lot, highlighted) => {
    if (lot && markerMapRef.current[lot.id]) {
      const marker = markerMapRef.current[lot.id];
      const size = highlighted ? 90 : 40;
      const markerImage = createMarkerImage(lot, size, highlighted);
      marker.setImage(markerImage);
      marker.setZIndex(highlighted ? 10 : 0);
    }
  }, [createMarkerImage]);

  // 마커 및 리스트 아이템 하이라이트 처리 함수
  const handleHighlight = useCallback((lot, highlighted) => {
    setHighlightedLot(highlighted ? lot : null);
    updateMarkerHighlight(lot, highlighted);
  }, [updateMarkerHighlight]);

  // 마우스 오버 이벤트 핸들러
  const handleMouseOverListItem = useCallback((lot) => {
    handleHighlight(lot, true);
  }, [handleHighlight]);

  // 마우스 아웃 이벤트 핸들러
  const handleMouseOutListItem = useCallback(() => {
    if (highlightedLot) {
      handleHighlight(highlightedLot, false);
    }
  }, [highlightedLot, handleHighlight]);

  // 사용자 위치 가져오기
  useEffect(() => {
    // 사용자의 현재 위치를 가져오는 함수
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });
            
            // 사용자 위치로 지도 중심 이동
            if (map && isMapReady) {
              const userLatLng = new kakao.maps.LatLng(lat, lng);
              map.setCenter(userLatLng);
            }
          },
          (error) => {
            console.error("사용자 위치를 가져오는데 실패했습니다:", error);
            alert("위치 정보를 가져올 수 없습니다. 기본 위치를 사용합니다.");
          }
        );
      } else {
        alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      }
    };

    getUserLocation();
  }, [map, isMapReady]);

  const updateVisibleParkingLots = useCallback(debounce(() => {
    if (!map) return;
    
    const center = map.getCenter();
    const circle = new kakao.maps.Circle({ center, radius });
    const bounds = circle.getBounds();

    const visibleLots = parkingLots.filter(lot => {
      const position = new kakao.maps.LatLng(lot.위도, lot.경도);
      return bounds.contain(position);
    });

    setVisibleParkingLots(visibleLots);
  }, 300), [map, parkingLots, radius]);

  const createCustomOverlay = useCallback((lot) => {
    const content = document.createElement('div');
    content.className = 'custom-overlay';
    content.style.padding = '5px';
    content.style.borderRadius = '5px';
    content.style.fontSize = '12px';
    content.style.fontWeight = 'bold';
    content.style.textAlign = 'center';
    content.style.minWidth = '100px';
    content.style.position = 'relative';  // 상대 위치 설정
    content.style.bottom = '25px';  // 아래쪽에서 40px 위로 이동

    // 잔여석에 따른 색상 설정
    let backgroundColor;
    if (lot.가능한주차면 === '0') {
      backgroundColor = 'red';
    } else if (lot.가능한주차면 <= 10) {
      backgroundColor = 'orange';
    } else {
      backgroundColor = 'green';
    }

    content.style.backgroundColor = backgroundColor;
    content.style.color = 'white';
    content.innerHTML = `
      <div>${lot.주차장명}</div>
      <div>잔여: ${lot.가능한주차면}</div>
      <div class="arrow"></div> <!-- 꼬리 추가 -->
    `;

    // 스타일을 삽입
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-overlay {
        position: relative; /* 위치 설정 */
        padding: 10px;
      }
      .custom-overlay .arrow {
        position: absolute;
        bottom: -10px; /* 꼬리가 오버레이 아래에 위치 */
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid ${backgroundColor}; /* 배경색과 동일 */
      }
    `;
    document.head.appendChild(style);

    return new kakao.maps.CustomOverlay({
      content: content,
      position: new kakao.maps.LatLng(lot.위도, lot.경도),
      zIndex: 1,
      yAnchor: 1.0  // y축 앵커 포인트를 오버레이의 하단으로 설정
    });
  }, []);

  useEffect(() => {
    if (!map || !parkingLots) return;

    // 클러스터러 초기화
    if (!clustererRef.current) {
      clustererRef.current = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 2, // 클러스터링을 최소 2개의 마커로 적용
        disableClickZoom: true,
      });
      console.log('클러스터러 초기화 완료');
    }

    // 클러스터러 클릭 이벤트 추가
    kakao.maps.event.addListener(clustererRef.current, 'clusterclick', (cluster) => {
      const level = map.getLevel() - 1;
      map.setLevel(level, { anchor: cluster.getCenter() });
    });

    // 기존 마커 제거
    Object.values(markerMapRef.current).forEach(marker => marker.setMap(null));
    markerMapRef.current = {};
    customOverlaysRef.current.forEach(overlay => overlay.setMap(null));
    customOverlaysRef.current = [];

    // 새 마커 생성
    const markers = parkingLots.map(lot => {
      if (lot.경도 && lot.위도) {
        const position = new kakao.maps.LatLng(lot.위도, lot.경도);
        const markerImage = createMarkerImage(lot);

        const marker = new kakao.maps.Marker({ 
          position, 
          image: markerImage, 
          zIndex: 0 
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }

          const infowindow = new kakao.maps.InfoWindow({
            content: createInfoWindowContent(lot),
            position: marker.getPosition(),
            zIndex: 9999,
          });

          infowindow.open(map, marker);
          setActiveInfoWindow(infowindow);
        });

        kakao.maps.event.addListener(marker, 'mouseover', () => {
          handleHighlight(lot, true);
        });

        kakao.maps.event.addListener(marker, 'mouseout', () => {
          handleHighlight(lot, false);
        });

        markerMapRef.current[lot.id] = marker;

        // 커스텀 오버레이 생성 및 추가
        const customOverlay = createCustomOverlay(lot);
        customOverlay.setMap(map);
        customOverlaysRef.current.push(customOverlay);

        return marker;
      }
      return null;
    }).filter(marker => marker !== null);

    // 클러스터러에 마커 추가
    clustererRef.current.addMarkers(markers);
    console.log('마커 클러스터러에 추가 완료:', markers.length);

    // 줌 레벨 변경 시 커스텀 오버레이 표시/숨김 처리
    const handleZoomChanged = () => {
      const currentZoom = map.getLevel();
      customOverlaysRef.current.forEach(overlay => {
        if (currentZoom > 2) { // 줌 레벨이 5보다 크면 숨김
          overlay.setMap(null);
        } else {
          overlay.setMap(map);
        }
      });
    };

    kakao.maps.event.addListener(map, 'zoom_changed', handleZoomChanged);

    const mapEventListeners = [];

    const addListener = (eventName, handler) => {
      const listener = kakao.maps.event.addListener(map, eventName, handler);
      mapEventListeners.push(listener);
    };

    addListener('center_changed', updateVisibleParkingLots);
    addListener('zoom_changed', updateVisibleParkingLots);
    addListener('click', () => {
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }
    });

    updateVisibleParkingLots();

    // 지도가 준비되었음을 표시
    setIsMapReady(true);

    return () => {
      mapEventListeners.forEach(listener => {
        if (listener && kakao.maps.event.removeListener) {
          kakao.maps.event.removeListener(listener);
        }
      });
      if (customOverlay) {
        customOverlay.setMap(null);
        setCustomOverlay(null);
      }
      // 클러스터러에서 마커 제거
      if (clustererRef.current) {
        clustererRef.current.clear();
        console.log('클러스터러 마커 제거 완료');
      }
      // 클린업 함수
      Object.values(markerMapRef.current).forEach(marker => {
        marker.setMap(null);
      });
      markerMapRef.current = {};
      // 커스텀 오버레이 제거
      customOverlaysRef.current.forEach(overlay => overlay.setMap(null));
      customOverlaysRef.current = [];
      // 줌 변경 이벤트 리스너 제거
      kakao.maps.event.removeListener(map, 'zoom_changed', handleZoomChanged);
    };
  }, [map, parkingLots, radius, activeInfoWindow, createInfoWindowContent, updateVisibleParkingLots, customOverlay, handleHighlight]);

  useEffect(() => {
    if (map) {
      const updateMapCenter = () => {
        const center = map.getCenter();
        mapCenterRef.current = { lat: center.getLat(), lng: center.getLng() };
      };

      const centerChangedListener = kakao.maps.event.addListener(map, 'center_changed', updateMapCenter);

      return () => {
        if (centerChangedListener && kakao.maps.event.removeListener) {
          kakao.maps.event.removeListener(centerChangedListener);
        }
      };
    }
  }, [map]);

  useEffect(() => {
    if (highlightedLot) {
      updateMarkerHighlight(highlightedLot, true);
    } else {
      updateMarkerHighlight(null, false);
    }
  }, [highlightedLot, updateMarkerHighlight]);

  return (
    <ParkingLotList 
      parkingLots={visibleParkingLots} 
      onMouseOverListItem={handleMouseOverListItem} 
      onMouseOutListItem={handleMouseOutListItem} 
      onClickListItem={handleClickListItem}
      highlightedLot={highlightedLot}
      onRadiusIncrease={handleRadiusIncrease}
      mapCenter={mapCenterRef.current}
      userLocation={userLocation}
    />
  );
};

export default React.memo(ParkingLotLayer);