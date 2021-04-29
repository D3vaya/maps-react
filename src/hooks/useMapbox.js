import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { v4 } from "uuid";
import { Subject } from "rxjs";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZDN2YXlhIiwiYSI6ImNrbzM1c292YjBuOTMyem9pNWpheWsydzYifQ.jKw24ndhd_e5NVZvf-Kxmg";

export const useMapbox = (initialPoint) => {
  const mapaDiv = useRef();
  const setRef = useCallback((node) => {
    mapaDiv.current = node;
  }, []);

  const markers = useRef({});

  const moveMarker = useRef(new Subject());
  const newMarker = useRef(new Subject());

  const mapRef = useRef();
  const [coords, setCoords] = useState(initialPoint);

  const addMarker = useCallback((coord, id) => {
    const { lng, lat } = coord.lngLat || coord;

    const marker = new mapboxgl.Marker();
    marker.id = id ?? v4();
    marker.setLngLat([lng, lat]).addTo(mapRef.current).setDraggable(true);
    markers.current[marker.id] = marker;

    if (!id) {
      // si el marcador tiene id no emite
      newMarker.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    // NOTE escuchar movimientos del marcador
    marker.on("drag", ({ target }) => {
      const { id } = target;
      const { lng, lat } = target.getLngLat();

      moveMarker.current.next({
        id,
        lng,
        lat,
      });
    });
  }, []);

  const updatePosition = useCallback(({ id, lng, lat }) => {
    markers.current[id].setLngLat([lng, lat]);
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [initialPoint.lng, initialPoint.lat],
      zoom: initialPoint.zoom,
    });
    mapRef.current = map;
  }, [initialPoint]);

  // NOTE listener cuando se mueve el mapa
  useEffect(() => {
    mapRef.current?.on("move", () => {
      const { lng, lat } = mapRef.current.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapRef.current.getZoom().toFixed(2),
      });
    });
    // NOTE eliminar la referencia si cambias de pantalla
    // return map?.off("move");
  }, []);

  // IMPORTANT se omite el parametro es6 puro
  useEffect(() => {
    mapRef.current?.on("click", addMarker);
  }, [addMarker]);

  return {
    addMarker,
    updatePosition,
    coords,
    markers,
    newMarker$: newMarker.current,
    moveMarker$: moveMarker.current,
    setRef,
  };
};
