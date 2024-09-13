import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';

export default function View() {
    const [map, setMap] = useState(null);
    const [mapView, setMapView] = useState({ level: 0, center: { lat: 0, lng: 0 } });
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        const container = document.getElementById('map');
        const options = {
            center: new window.kakao.maps.LatLng(33.450701, 126.570667),
            level: 3
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);

        // 지도 중심 좌표나 확대 수준이 변경되면 이벤트 발생
        window.kakao.maps.event.addListener(newMap, 'idle', function() {
            const level = newMap.getLevel();
            const latlng = newMap.getCenter();
            
            setMapView({
                level: level,
                center: { lat: latlng.getLat(), lng: latlng.getLng() }
            });

            // 주소-좌표 변환 객체를 생성
            const geocoder = new window.kakao.maps.services.Geocoder();

            // 좌표로 주소 정보를 요청
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setLocationName(result[0].address.address_name);
                }
            });
        });
    }, []);

    return (
        <Box sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h6">위치 정보</Typography>
            <div id="map" style={{ width: '100%', height: '2px' }}></div>
            <Stack spacing={1} alignItems="center">
                <Typography>줌 레벨: {mapView.level}</Typography>
                <Typography>위도: {mapView.center.lat}</Typography>
                <Typography>경도: {mapView.center.lng}</Typography>
                <Typography>위치명: {locationName}</Typography>
            </Stack>
        </Box>
    );
}