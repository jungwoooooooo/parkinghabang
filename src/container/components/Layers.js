import React, { useEffect } from "react";
import { useMap } from "../map/MapContext";

const Layers = ({ layers }) => {
  const { map } = useMap(); // map element

  const onLayerClick = (layer) => {
    layer.setVisible(!layer.getVisible());
  };

  useEffect(() => {
    if (!map) return;

    layers.map((layer) => {
      map.addLayer(layer); //map에 추가
    });
  }, [map]);

  return (
    <div className="layer-list">
      레이어 목록
      {layers &&
        layers.map((layer, index) => (
          <button
            key={"layer-" + index}
            className="layer-item"
            onClick={() => {
              onLayerClick(layer);
            }}
          >
            {layer.get("title")}
          </button>
        ))}
    </div>
  );
};

export default Layers;
