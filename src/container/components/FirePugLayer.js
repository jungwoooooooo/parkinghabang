import React, { useState, useEffect } from 'react';
import { useMap } from '../map/MapContext'; // Adjust the import path as needed

const { kakao } = window;

const FirePlugLayer = ({ firePlugData }) => {
  const { map } = useMap();
  const [markers, setMarkers] = useState([]);
  const [circles, setCircles] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [isLayerVisible, setIsLayerVisible] = useState(false);

  useEffect(() => {
    if (!map || !firePlugData) return;

    // Function to handle the display of markers and circles
    const displayLayer = () => {
      markers.forEach(marker => marker.setMap(null));
      circles.forEach(circle => circle.setMap(null));
      setMarkers([]);
      setCircles([]);

      if (!isLayerVisible) return;

      const firePlugIconUrl = 'https://cdn-icons-png.flaticon.com/512/7499/7499842.png'; // Use an appropriate icon URL
      const circleRadius = 5;

      const newMarkers = [];
      const newCircles = [];

      firePlugData.forEach(plug => {
        if (plug.lat && plug.lon) {
          const position = new kakao.maps.LatLng(plug.lat, plug.lon);

          const marker = new kakao.maps.Marker({
            position,
            map,
            title: plug.category,
            image: new kakao.maps.MarkerImage(firePlugIconUrl, new kakao.maps.Size(32, 32)),
          });

          const circle = new kakao.maps.Circle({
            center: position,
            radius: circleRadius,
            strokeWeight: 2,
            strokeColor: '#0000ff',
            strokeOpacity: 0.8,
            fillColor: '#0000ff',
            fillOpacity: 0.2,
          });
          circle.setMap(map);

          kakao.maps.event.addListener(marker, 'click', () => {
            if (activeInfoWindow) {
              activeInfoWindow.close();
            }

            const content = `
              <div>
                <h2>소화전</h2>
                <h3>카테고리: ${plug.category}</h3>
                <p>위치: ${plug.lat}, ${plug.lon}</p>
                <p>주소: ${plug.address || '주소 정보 없음'}</p>
              </div>
            `;

            const infowindow = new kakao.maps.InfoWindow({
              content,
              position: marker.getPosition(),
            });

            infowindow.open(map, marker);
            setActiveInfoWindow(infowindow);
          });

          newMarkers.push(marker);
          newCircles.push(circle);
        }
      });

      setMarkers(newMarkers);
      setCircles(newCircles);
    };

    // Display the layer if visible
    displayLayer();

    // Handle click events to close info windows
    kakao.maps.event.addListener(map, 'click', () => {
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }
    });

    // Handle zoom level changes
    const handleZoomChange = () => {
      const level = map.getLevel();
      // Example zoom level threshold (change as needed)
      const zoomThreshold = 8;
      if (level > zoomThreshold && !isLayerVisible) {
        setIsLayerVisible(true);
      } else if (level <= zoomThreshold && isLayerVisible) {
        setIsLayerVisible(false);
      }
    };

    // Add event listener for zoom level changes
    kakao.maps.event.addListener(map, 'zoom_changed', handleZoomChange);

    // Clean up event listener on component unmount
    return () => {
      kakao.maps.event.removeListener(map, 'zoom_changed', handleZoomChange);
    };
  }, [map, firePlugData, isLayerVisible]);

  const toggleLayerVisibility = () => {
    setIsLayerVisible(prev => !prev);
  };

  return (
    <>
      <button onClick={toggleLayerVisibility} style={{ position: 'absolute', top: 10, left: 170, zIndex: 1000 }}>
        {isLayerVisible ? '숨기기' : '소화전 보기'}
      </button>
    </>
  );
};

export default FirePlugLayer;
