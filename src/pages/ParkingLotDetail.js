import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';

const ParkingLotDetail = ({ parkingLots }) => {
  const { id } = useParams();
  const parkingLot = parkingLots.find(lot => lot.id === parseInt(id));

  if (!parkingLot) {
    return <Typography>주차장을 찾을 수 없습니다.</Typography>;
  }

  return (
    <Box padding="16px">
      <Paper elevation={3} style={{ padding: '16px' }}>
        <Typography variant="h4">{parkingLot.주차장명}</Typography>
        <Typography variant="body1">요금: {parkingLot.요금정보}</Typography>
        <Typography variant="body1">잔여 수: {parkingLot.가능한주차면}</Typography>
        <Typography variant="body1">주소: {parkingLot.소재지도로명주소}</Typography>
        <Typography variant="body1">운영요일: {parkingLot.운영요일}</Typography>
        <Typography variant="body1">기본 요금: {parkingLot.주차기본요금}</Typography>
        <Box display="flex" justifyContent="center" marginTop="16px">
          <Link to={`/reservation?lotId=${parkingLot.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">예약하기</Button>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ParkingLotDetail;