import React from 'react';
import { Roadview } from 'react-kakao-maps-sdk';

const KakaoRoadView = () => {
  return (
    <Roadview
      position={{
        lat: 33.450701,  // 유효한 좌표
        lng: 126.570667
      }}
      radius={50}  // 선택적, 로드뷰의 시청 범위
      style={{ width: '100%', height: '450px' }}  // 로드뷰의 크기
    />
  );
};

export default KakaoRoadView;
