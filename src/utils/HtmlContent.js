import React from 'react';
import { Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const generateHtmlContent = (lot) => {
  return `
    <div style="padding: 16px; font-family: Arial, sans-serif;">
      <h2 style="margin: 0; font-size: 18px; color: #333;">상세정보</h2>
      <h3 style="margin: 8px 0; font-size: 16px; color: #555;">${lot.주차장명}</h3>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">주차장 구분: ${lot.주차장구분}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">주차장 유형: ${lot.주차장유형}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">소재지 도로명 주소: ${lot.소재지도로명주소}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">소재지 지번 주소: ${lot.소재지지번주소}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">주차 구획 수: ${lot.주차구획수}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">운영 요일: ${lot.운영요일}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">전화 번호: ${lot.전화번호}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">기본 요금: ${lot.주차기본요금}원</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">총 주차 면: ${lot.총주차면}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">가능한 주차 면: ${lot.가능한주차면}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #666;">요금 정보: ${lot.요금정보}</p>
    </div>
  `;
};

export default generateHtmlContent;
