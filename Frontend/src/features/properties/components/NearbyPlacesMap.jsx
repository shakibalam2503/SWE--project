import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import toast from 'react-hot-toast';
import './NearbyPlacesMap.css';

const customIcons = {
    school: '🏫',
    hospital: '🏥',
    restaurant: '🍴',
    park: '🌲',
    bus_station: '🚌'
};

const getSvgIcon = (emoji) => {
    return `data:image/svg+xml;charset=UTF-8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="white" stroke="#3b82f6" stroke-width="2"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="16">${emoji}</text>
        </svg>
    `);
};

const NearbyPlacesMap = ({ isLoaded, property }) => {
    const [mapInstance, setMapInstance] = useState(null);
    const [selectedPlaceType, setSelectedPlaceType] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [selectedPlaceInfo, setSelectedPlaceInfo] = useState(null);

    const handlePlaceToggle = (type) => {
        if (selectedPlaceType === type) {
            setSelectedPlaceType(null);
            setNearbyPlaces([]);
            setSelectedPlaceInfo(null);
            if (mapInstance && property?.latitude) {
                mapInstance.setCenter({ lat: Number(property.latitude), lng: Number(property.longitude) });
                mapInstance.setZoom(15);
            }
        } else {
            setSelectedPlaceType(type);
            setSelectedPlaceInfo(null);
            fetchNearbyPlaces(type);
        }
    };

    const fetchNearbyPlaces = useCallback((type) => {
        if (!mapInstance || !property?.latitude || !property?.longitude) return;
        
        try {
            const service = new window.google.maps.places.PlacesService(mapInstance);
            const request = {
                location: new window.google.maps.LatLng(Number(property.latitude), Number(property.longitude)),
                radius: 2000, // 2 km
                type: type
            };

            service.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    const topResults = results.slice(0, 15);
                    setNearbyPlaces(topResults);
                    
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(new window.google.maps.LatLng(Number(property.latitude), Number(property.longitude)));
                    topResults.forEach(place => {
                        bounds.extend(place.geometry.location);
                    });
                    mapInstance.fitBounds(bounds);
                } else {
                    setNearbyPlaces([]);
                    toast.error(`No nearby locations found for this category.`);
                }
            });
        } catch (error) {
            console.error("PlacesService error:", error);
            toast.error("Failed to load nearby places.");
        }
    }, [mapInstance, property]);

    const onLoad = useCallback((map) => {
        setMapInstance(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMapInstance(null);
    }, []);

    const center = { lat: Number(property?.latitude) || 23.8103, lng: Number(property?.longitude) || 90.4125 };

    if (!isLoaded || !property?.latitude || !property?.longitude) {
        return (
            <div className="map-placeholder" style={{ height: '320px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Map View" className="map-image" />
            </div>
        );
    }

    return (
        <div className="nearby-places-container">
            <div className="nearby-places-bar">
                <button className={`place-btn ${selectedPlaceType === 'school' ? 'active' : ''}`} onClick={() => handlePlaceToggle('school')}>🏫 Schools</button>
                <button className={`place-btn ${selectedPlaceType === 'hospital' ? 'active' : ''}`} onClick={() => handlePlaceToggle('hospital')}>🏥 Hospitals</button>
                <button className={`place-btn ${selectedPlaceType === 'restaurant' ? 'active' : ''}`} onClick={() => handlePlaceToggle('restaurant')}>🍴 Restaurants</button>
                <button className={`place-btn ${selectedPlaceType === 'park' ? 'active' : ''}`} onClick={() => handlePlaceToggle('park')}>🌲 Parks</button>
                <button className={`place-btn ${selectedPlaceType === 'bus_station' ? 'active' : ''}`} onClick={() => handlePlaceToggle('bus_station')}>🚌 Bus Stops</button>
                {selectedPlaceType && <button className="place-btn clear" onClick={() => handlePlaceToggle(selectedPlaceType)}>✕ Clear</button>}
            </div>
            
            <div className="map-wrapper" style={{ height: '320px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                    {/* Main Property Marker */}
                    <Marker 
                        position={center} 
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        }}
                        zIndex={100}
                    />

                    {/* Nearby Places Markers */}
                    {nearbyPlaces.map(place => (
                        <Marker 
                            key={place.place_id} 
                            position={place.geometry.location} 
                            icon={{
                                url: getSvgIcon(customIcons[selectedPlaceType] || '📍'),
                                scaledSize: new window.google.maps.Size(32, 32)
                            }}
                            title={place.name}
                            onClick={() => setSelectedPlaceInfo(place)}
                        />
                    ))}

                    {/* Info Window for Selected Place */}
                    {selectedPlaceInfo && (
                        <InfoWindow
                            position={selectedPlaceInfo.geometry.location}
                            onCloseClick={() => setSelectedPlaceInfo(null)}
                        >
                            <div className="place-info-window">
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e293b' }}>{selectedPlaceInfo.name}</h4>
                                <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>{selectedPlaceInfo.vicinity}</p>
                                {selectedPlaceInfo.rating && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#eab308', fontWeight: 'bold' }}>
                                        ★ {selectedPlaceInfo.rating}
                                    </p>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </div>
    );
};

export default NearbyPlacesMap;
