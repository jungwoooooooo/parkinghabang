// 카카오 주차장 경로 찾기
export async function getCarDirection(startPoint, endPoint) {
    const REST_API_KEY = '5ec7f2e09042f5b2767eac42a19e37f1';//카카오 주차장 경로 찾기
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';//

    const origin = `${startPoint.lng},${startPoint.lat}`; // 출발지 좌표
    const destination = `${endPoint.lng},${endPoint.lat}`; // 도착지 좌표
    const priority = 'time';//우선순위

    // 헤더 설정
    const headers = {
      Authorization: `KakaoAK ${REST_API_KEY}`,
      'Content-Type': 'application/json'
    };
  
    // 쿼리 파라미터 설정
    const queryParams = new URLSearchParams({
      origin: origin,//출발지 좌표
      destination: destination,//도착지 좌표,
      priority: priority
    });
    
    // 요청 URL 생성
    const requestUrl = `${url}?${queryParams}`;

    // 요청 처리
    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (!data.routes || data.routes.length === 0) {
        throw new Error('경로 데이터를 찾을 수 없습니다.');
      }

      // 경로 탐색 결과 코드를 확인합니다
      if (data.routes[0].result_code !== 0) {
        throw new Error(`경로 탐색 실패: ${data.routes[0].result_msg}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getCarDirection:', error);
      throw error;
    }
  }