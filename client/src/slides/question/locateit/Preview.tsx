import { LocateItSlide } from "@/models/Quiz";
import { APIProvider, Map, AdvancedMarker, Pin, MapControl, ControlPosition } from "@vis.gl/react-google-maps"
import { useState, useEffect } from "react";

import { Circle } from "./_circle";
import { PlaceAutocompleteClassic } from "./_autocomplete";

export function Preview({
  slide,
  onSlideUpdate,
}: {
  slide: LocateItSlide;
  onSlideUpdate: (slide: LocateItSlide) => void;
}) {
  const APIKEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [zoom, setZoom] = useState(6);
  const [circleCenter, setCircleCenter] = useState<google.maps.LatLngLiteral>();
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(
    slide.location,
  );
  const [circleRadius, setCircleRadius] = useState<number>(slide.radius);
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);

  // Initialize marker position from slide.location
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral>(slide.location);

  // Update marker position if slide.location changes externally
  useEffect(() => {
    setMarkerPosition(slide.location);
    setCircleCenter(slide.location);
    setMapCenter(slide.location);
  }, [slide.location]);

  useEffect(() => {
    setCircleRadius(slide.radius);
  }, [slide.radius]);

  useEffect(() => {
    if (currentSlideId !== slide.id) {
      setCurrentSlideId(slide.id);
    }
  }, [slide.id, currentSlideId]);

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();

      const updatedPosition = { lat: newLat, lng: newLng };
      setMarkerPosition(updatedPosition);

      // Update the slide with the new location
      const updatedSlide: LocateItSlide = {
        ...slide,
        location: updatedPosition,
      };
      onSlideUpdate(updatedSlide);
    }
  };

  const onPlacesChanged = (place: google.maps.places.PlaceResult | null) => {
    if (!place) return;
    if (place.geometry?.location) {
      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      const newPosition = { lat: newLat, lng: newLng };
      setMarkerPosition(newPosition);
      const updatedSlide: LocateItSlide = {
        ...slide,
        location: newPosition,
      };
      onSlideUpdate(updatedSlide);
      setMapCenter(newPosition);
      setZoom(14);
    }
  };

  const handleCircleRadiusChange = (radius: number) => {
    if (!onSlideUpdate || slide.id !== currentSlideId) return;
    const newRadius = Math.floor(radius);

    if (newRadius === slide.radius) return;

    setCircleRadius(newRadius);
    const updatedSlide: LocateItSlide = {
      ...slide,
      radius: newRadius,
    };
    onSlideUpdate(updatedSlide);
  };

  return (
    <div className="w-full h-full relative">
      <APIProvider apiKey={APIKEY}>
        <Map
          mapId="classic"
          style={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={zoom}
          onCenterChanged={(e) => setMapCenter(e.detail.center)}
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
        >
        
          <MapControl position={ControlPosition.TOP}>
            <PlaceAutocompleteClassic onPlaceSelect={onPlacesChanged} />
          </MapControl>
          {(slide.awardPointsLocation === "RADIUS" || slide.awardPointsLocation === "DISTANCE") && (
            <Circle
              onRadiusChanged={handleCircleRadiusChange}
              center={circleCenter}
              radius={circleRadius}
              strokeColor={'#0c4cb3'}
              strokeOpacity={1}
              strokeWeight={3}
              fillColor={'#3b82f6'}
              fillOpacity={0.3}
              editable
            />
          )}
          <AdvancedMarker
            position={markerPosition}
            draggable={true}
            onDragEnd={handleDragEnd}
          >
            <Pin scale={2} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
