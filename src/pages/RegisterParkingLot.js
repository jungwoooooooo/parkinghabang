import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const RegisterParkingLot = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [fee, setFee] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleRegister = () => {
    // 주차장 등록 로직 추가
    console.log('주차장 등록 시도:', { name, address, fee, capacity });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" gutterBottom>주차장 등록</Typography>
      <TextField
        label="주차장 이름"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="주소"
        variant="outlined"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="요금"
        variant="outlined"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="수용 가능 차량 수"
        variant="outlined"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        margin="normal"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleRegister} style={{ marginTop: '16px' }}>
        등록하기
      </Button>
    </Box>
  );
};

export default RegisterParkingLot;