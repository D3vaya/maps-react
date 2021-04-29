import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";

import { useMapbox } from "../hooks/useMapbox";

const initialPoint = {
  lng: -122.4725,
  lat: 37.801,
  zoom: 13.5,
};
export const MapaPage = () => {
  const {
    coords,
    setRef,
    newMarker$,
    moveMarker$,
    addMarker,
    updatePosition,
  } = useMapbox(initialPoint);
  const { socket } = useContext(SocketContext);
  // const [state, setstate] = useState(initialState)

  useEffect(() => {
    socket.on("active-markers", (markers) => {
      for (const key of Object.keys(markers)) {
        addMarker(markers[key], key);
      }
    });
  }, [socket, addMarker]);

  useEffect(() => {
    newMarker$.subscribe((marker) => {
      socket.emit("new-marker", marker);
    });
  }, [newMarker$, socket]);

  useEffect(() => {
    moveMarker$.subscribe((markerCoords) => {
      socket.emit("update-marker", markerCoords);
    });
  }, [moveMarker$, socket]);

  // escuchar marcadores
  useEffect(() => {
    socket.on(
      "new-marker",
      (marker) => {
        addMarker(marker, marker.id);
      },
      [socket]
    );
  });

  useEffect(() => {
    socket.on(
      "update-marker",
      (marker) => {
        updatePosition(marker);
      },
      [socket, updatePosition]
    );
  });

  return (
    <>
      <div className="info">
        Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
      </div>
      <div ref={setRef} className="mapContainer"></div>
    </>
  );
};
