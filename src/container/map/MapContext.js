// src/map/MapContext.js
import React, { createContext, useState, useContext } from 'react';

const MapContext = createContext();

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 기본 중심 좌표

  return (
    <MapContext.Provider value={{ map, setMap, center, setCenter }}>
      {children}
    </MapContext.Provider>
  );
};
