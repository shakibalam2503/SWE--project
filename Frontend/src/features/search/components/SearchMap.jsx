import React, {
    useMemo,
    useCallback,
    useState,
    useEffect
} from "react"

import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Polyline
} from "@react-google-maps/api"

import { useSearchState } from "../states/SearchContext"

const containerStyle = {
    width: "100%",
    height: "100%",
}

// Default fallback center

const defaultCenter = {
    lat: 23.8103,
    lng: 90.4125,
}

// Clean Real Estate Style Map
// Keeps POIs visible
// while matching website theme

const mapStyles = [

    // Water

    {
        featureType: "water",
        elementType: "geometry",
        stylers: [
            {
                color: "#DCE3EE",
            },
        ],
    },

    // Background

    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [
            {
                color: "#F9FBFC",
            },
        ],
    },

    // Roads

    {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [
            {
                color: "#FFFFFF",
            },
        ],
    },

    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [
            {
                color: "#E5E7EB",
            },
            {
                weight: 1,
            },
        ],
    },

    // POI Geometry

    {
        featureType: "poi",
        elementType: "geometry",
        stylers: [
            {
                color: "#F3F4F6",
            },
        ],
    },

    // Business Labels

    {
        featureType: "poi.business",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },

    // Hospital Labels

    {
        featureType: "poi.medical",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },

    // School Labels

    {
        featureType: "poi.school",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },

    // Text Color

    {
        elementType: "labels.text.fill",
        stylers: [
            {
                color: "#6B7280",
            },
        ],
    },

    // Text Outline

    {
        elementType: "labels.text.stroke",
        stylers: [
            {
                color: "#FFFFFF",
            },
            {
                weight: 2,
            },
        ],
    },

    // Administrative Borders

    {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [
            {
                color: "#E5E7EB",
            },
        ],
    },
]

// Map options

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    styles: mapStyles,
}

const GOOGLE_MAPS_LIBRARIES = ['places'];

const SearchMap = ({
    properties = [],
    hoveredPropertyId,
}) => {
    const { landmarkData } = useSearchState();

    const [map, setMap] =
        useState(null)

    // Load Google Maps Script

    const { isLoaded } =
        useJsApiLoader({
            id: "google-map-script",
            googleMapsApiKey:
                import.meta.env
                    .VITE_GOOGLE_MAPS_API_KEY || "",
            libraries: GOOGLE_MAPS_LIBRARIES
        })

    // On Load

    const onLoad =
        useCallback((mapInstance) => {

            setMap(mapInstance)

        }, [])

    // On Unmount

    const onUnmount =
        useCallback(() => {

            setMap(null)

        }, [])

    // Dynamic Center

    const center = useMemo(() => {

        if (landmarkData && landmarkData.coordinates) {
            return {
                lat: Number(landmarkData.coordinates.lat),
                lng: Number(landmarkData.coordinates.lng),
            };
        }

        if (
            properties &&
            properties.length > 0
        ) {

            return {
                lat: Number(
                    properties[0].latitude
                ),
                lng: Number(
                    properties[0].longitude
                ),
            }
        }

        return defaultCenter

    }, [properties, landmarkData])

    // Fit Bounds

    useEffect(() => {

        if (
            map &&
            (properties && properties.length > 0 || landmarkData)
        ) {

            const bounds =
                new window.google.maps
                    .LatLngBounds()

            if (landmarkData && landmarkData.coordinates) {
                bounds.extend({
                    lat: Number(landmarkData.coordinates.lat),
                    lng: Number(landmarkData.coordinates.lng),
                });
            }

            if (properties) {
                properties.forEach(
                    (property) => {

                        if (
                            property.latitude &&
                            property.longitude
                        ) {

                            bounds.extend({
                                lat: Number(
                                    property.latitude
                                ),
                                lng: Number(
                                    property.longitude
                                ),
                            })
                        }
                    }
                )
            }

            map.fitBounds(bounds)
            
            // Apply a little padding after fitBounds to avoid markers touching edges
            if (landmarkData || properties.length === 1) {
                // Adjust zoom if we only have one point
                const listener = window.google.maps.event.addListener(map, "idle", function() {
                    if (map.getZoom() > 14) map.setZoom(14);
                    window.google.maps.event.removeListener(listener);
                });
            }
        }

    }, [map, properties, landmarkData])

    // Loading State

    if (!isLoaded) {

        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontWeight: "600",
                }}
            >
                Loading Map...
            </div>
        )
    }

    return (

        <GoogleMap
            mapContainerStyle={
                containerStyle
            }
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >

            {properties.map(
                (property, index) => {

                    // Skip invalid coords

                    if (
                        isNaN(
                            Number(
                                property.latitude
                            )
                        ) ||
                        isNaN(
                            Number(
                                property.longitude
                            )
                        )
                    ) {

                        return null
                    }

                    const propertyPosition = {
                        lat: Number(property.latitude),
                        lng: Number(property.longitude),
                    };

                    return (
                        <React.Fragment key={property.id}>
                            <Marker
                                position={propertyPosition}

                                label={{
                                    text: "🏠",

                                    color:
                                        hoveredPropertyId ===
                                        property.id
                                            ? "white"
                                            : "black",

                                    fontWeight:
                                        "bold",

                                    fontSize:
                                        "14px",
                                }}

                                icon={{
                                    path: window.google
                                        .maps.SymbolPath
                                        .CIRCLE,

                                    fillColor:
                                        hoveredPropertyId ===
                                        property.id
                                            ? "#1F3B66"
                                            : "white",

                                    fillOpacity: 1,

                                    strokeColor:
                                        "#1F3B66",

                                    strokeWeight: 2,

                                    scale:
                                        properties.length > 1
                                            ? 12
                                            : 24,
                                }}

                                zIndex={
                                    hoveredPropertyId ===
                                    property.id
                                        ? 100
                                        : 1
                                }
                            />

                            {/* Render Distance Line if Landmark Exists */}
                            {landmarkData && landmarkData.coordinates && (
                                <Polyline
                                    path={[
                                        {
                                            lat: Number(landmarkData.coordinates.lat),
                                            lng: Number(landmarkData.coordinates.lng),
                                        },
                                        propertyPosition
                                    ]}
                                    options={{
                                        strokeColor: "#3B82F6",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 3,
                                        icons: [{
                                            icon: {
                                                path: 'M 0,-1 0,1',
                                                strokeOpacity: 1,
                                                scale: 4
                                            },
                                            offset: '0',
                                            repeat: '20px'
                                        }],
                                    }}
                                />
                            )}
                        </React.Fragment>
                    )
                }
            )}

            {/* Render Landmark Marker */}
            {landmarkData && landmarkData.coordinates && (
                <Marker
                    position={{
                        lat: Number(landmarkData.coordinates.lat),
                        lng: Number(landmarkData.coordinates.lng),
                    }}
                    label={{
                        text: "🎯",
                        fontSize: "18px",
                    }}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: "#EF4444",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                        scale: 14,
                    }}
                    zIndex={200}
                    title={landmarkData.landmark_name || "Target Location"}
                />
            )}

        </GoogleMap>
    )
}

export default React.memo(SearchMap)