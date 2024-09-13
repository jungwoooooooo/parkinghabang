import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const Reservation = ({ parkingLots }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [parkingLot, setParkingLot] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lotId = params.get('lotId');
    if (lotId) {
      const lot = parkingLots.find(lot => lot.id === parseInt(lotId));
      setParkingLot(lot);
    }
  }, [location.search, parkingLots]);

  const handleReservation = () => {
    // 예약 로직 추가
    console.log('예약 시도:', { name, date, time, parkingLot });
  };

  if (!parkingLot) {
    return <Typography>주차장을 찾을 수 없습니다.</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" gutterBottom>예약</Typography>
      <Typography variant="h6" gutterBottom>{parkingLot.주차장명}</Typography>
      <TextField
        label="이름"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="날짜"
        type="date"
        variant="outlined"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        margin="normal"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="시간"
        type="time"
        variant="outlined"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        margin="normal"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="contained" color="primary" onClick={handleReservation} style={{ marginTop: '16px' }}>
        예약하기
      </Button>
    </Box>
  );
};

export default Reservation;