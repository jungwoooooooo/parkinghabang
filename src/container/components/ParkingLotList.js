import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, Typography, Button, Paper, Box, Divider, Alert, AlertTitle, Drawer, Menu, MenuItem, Popover } from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import { FormControl, InputLabel, Select } from '@mui/material';
import { debounce } from 'lodash';
import useMediaQuery from '@mui/material/useMediaQuery';

const theme = createTheme();

// 주차장 리스트 스타일 컴포넌트
const StyledListItem = styled(ListItem)(({ theme, highlighted }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: highlighted ? theme.palette.action.selected : 'inherit',
  border: '2px solid #000',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// 주차장 리스트 컴포넌트
const ParkingLotList = ({ parkingLots, onMouseOverListItem, onMouseOutListItem, onClickListItem, highlightedLot, onRadiusIncrease, mapCenter, currentRadius, userLocation }) => {
  const [showRadiusAlert, setShowRadiusAlert] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [sortedParkingLots, setSortedParkingLots] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (parkingLots.length <= 2) {
      setShowRadiusAlert(true);
    } else {
      setShowRadiusAlert(false);
    }

    const sortLots = () => {
      const referenceLocation = userLocation || mapCenter;

      if (!referenceLocation || typeof referenceLocation.lat !== 'number' || typeof referenceLocation.lng !== 'number') {
        console.warn('위치 정보가 올바르게 정의되지 않았습니다:', referenceLocation);
        setSortedParkingLots(parkingLots);
        return;
      }

      const sorted = [...parkingLots].map(lot => {
        const distance = calculateDistance(
          parseFloat(lot.위도), 
          parseFloat(lot.경도), 
          referenceLocation.lat, 
          referenceLocation.lng
        );
        return {
          ...lot,
          distance: Math.round(distance * 1000)
        };
      }).sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distance - b.distance;
        } else if (sortBy === 'price') {
          const priceA = parseFloat(a.요금정보.replace(/[^0-9.-]+/g,"")) || 0;
          const priceB = parseFloat(b.요금정보.replace(/[^0-9.-]+/g,"")) || 0;
          return priceA - priceB;
        }
        return 0;
      });

      setSortedParkingLots(sorted);
    };

    sortLots();
  }, [parkingLots, sortBy, userLocation, mapCenter]);

  const handleRadiusIncrease = () => {
    onRadiusIncrease();
    setShowRadiusAlert(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

  const debouncedMouseOver = React.useMemo(
    () => debounce((lot) => {
      onMouseOverListItem && onMouseOverListItem(lot);
    }, 300),
    [onMouseOverListItem]
  );

  const debouncedMouseOut = React.useMemo(
    () => debounce((lot) => {
      onMouseOutListItem && onMouseOutListItem(lot);
    }, 300),
    [onMouseOutListItem]
  );

  const handleFindRouteClick = (event, lot) => {
    setAnchorEl(event.currentTarget);
    setSelectedLot(lot);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMapChoice = (mapType) => {
    if (!selectedLot) return;

    const encodedName = encodeURIComponent(selectedLot.주차장명);
    let url;

    if (mapType === 'kakao') {
      url = `https://map.kakao.com/link/to/${encodedName},${selectedLot.위도},${selectedLot.경도}`;
    } else if (mapType === 'naver') {
      const startLat = userLocation ? userLocation.lat : mapCenter.lat;
      const startLng = userLocation ? userLocation.lng : mapCenter.lng;
      url = `http://map.naver.com/index.nhn?slng=${startLng}&slat=${startLat}&stext=현재위치&elng=${selectedLot.경도}&elat=${selectedLot.위도}&etext=${encodedName}&menu=route`;
    }

    window.open(url, '_blank');
    handleClose();
  };

  const MemoizedListItem = React.memo(({ lot, index }) => {
    const isHighlighted = highlightedLot && highlightedLot.id === lot.id;

    const handleMouseEnter = React.useCallback(() => {
      debouncedMouseOver(lot);
    }, [lot]);

    const handleMouseLeave = React.useCallback(() => {
      debouncedMouseOut(lot);
    }, [lot]);

    const handleClick = React.useCallback(() => {
      onClickListItem && onClickListItem(lot);
    }, [lot]);

    const formatDistance = (distance) => {
      return distance > 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
    };

    return (
      <React.Fragment>
        <StyledListItem
          data-highlighted={isHighlighted ? 'true' : 'false'}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <Box>
            <Typography variant="subtitle1">{lot.주차장명}</Typography>
            <Typography variant="body2">요금: {lot.요금정보}</Typography>
            <Typography variant="body2">잔여 수: {lot.가능한주차면}</Typography>
            <Typography variant="body2">거리: {formatDistance(lot.distance)}</Typography>
            <Box mt={1}>
              <Button component={Link} to={`/parking-lot/${lot.id}`} variant="outlined" size="small" sx={{ mr: 1 }}>
                상세 정보
              </Button>
              <Button component={Link} to={`/reservation?lotId=${lot.id}`} variant="contained" size="small" sx={{ mr: 1 }}>
                예약하기
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                color="secondary" 
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  handleFindRouteClick(e, lot);
                }}
              >
                길찾기
              </Button>
            </Box>
          </Box>
        </StyledListItem>
        {index < sortedParkingLots.length - 1 && <Divider />}
      </React.Fragment>
    );
  }, (prevProps, nextProps) => {
    return prevProps.lot.id === nextProps.lot.id &&
           prevProps.index === nextProps.index &&
           (prevProps.highlightedLot && prevProps.highlightedLot.id) === (nextProps.highlightedLot && nextProps.highlightedLot.id);
  });

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawerContent = (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>주차장 리스트</Typography>
      <Typography variant="body2" gutterBottom>현재 검색 반경: {currentRadius}m</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>정렬 기준</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value="distance">거리순</MenuItem>
          <MenuItem value="price">요금순</MenuItem>
        </Select>
      </FormControl>
      {showRadiusAlert && (
        <Alert 
          severity="info" 
          action={
            <Button color="inherit" size="small" onClick={handleRadiusIncrease}>
              네
            </Button>
          }
          onClose={() => setShowRadiusAlert(false)}
        >
          <AlertTitle>반경 확장</AlertTitle>
          현재 반경 {currentRadius}m를 확장하여 다시 검색하시겠습니까?
        </Alert>
      )}
      <List>
        {sortedParkingLots.map((lot, index) => (
          <MemoizedListItem 
            key={lot.id} 
            lot={lot} 
            index={index} 
            highlightedLot={highlightedLot}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      {isMobile ? (
        <>
          <Button 
            variant="contained" 
            onClick={toggleDrawer} 
            sx={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
          >
            주차장 리스트 {isDrawerOpen ? '닫기' : '열기'}
          </Button>
          <Drawer
            anchor="bottom"
            open={isDrawerOpen}
            onClose={toggleDrawer}
            sx={{
              '& .MuiDrawer-paper': {
                height: '70%',
                overflow: 'auto',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Paper elevation={3} sx={{ 
          width: '320px', 
          height: 'calc(93vh - 200px)', 
          overflowY: 'auto', 
          position: 'absolute', 
          left: 0, 
          top: '280px', 
          zIndex: 10,
        }}>
          {drawerContent}
        </Paper>
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleMapChoice('kakao')}>카카오 지도로 보기</MenuItem>
        <MenuItem onClick={() => handleMapChoice('naver')}>네이버 지도로 보기</MenuItem>
      </Popover>
    </ThemeProvider>
  );
};

export default React.memo(ParkingLotList);