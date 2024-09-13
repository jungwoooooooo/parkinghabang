import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

// 색상과 스타일을 사용자 정의합니다.
const customAppBarStyle = {
  backgroundColor: '#E0F2F7', // 헤더 배경 색상
  height: '50px', // 헤더 높이
};

const customToolbarStyle = {
  height: '100%', // 툴바의 높이를 헤더에 맞추기
  display: 'flex',
  justifyContent: 'space-between', // 제목과 버튼을 양쪽 끝으로 배치
  alignItems: 'center', // 세로 중앙 정렬
  padding: '0 16px', // 툴바의 패딩
};

const customTypographyStyle = {
  color: '#333', // 글씨 색상
  flexGrow: 1, // 제목을 가능한 넓게 확장
  textAlign: 'center', // 제목 중앙 정렬
};

const customButtonStyle = {
  color: '#00796B', // 버튼 글씨 색상
};

const Header = () => {
  return (
    <AppBar position="static" sx={customAppBarStyle}>
      <Toolbar sx={customToolbarStyle}>
        <Typography variant="h6" component="div" sx={customTypographyStyle}>
          Parking service
        </Typography>
        <div>
          <Button sx={customButtonStyle} style={{ marginRight: '8px' }}>로그인</Button>
          <Button sx={customButtonStyle}>회원가입</Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
