function parseSearchQuery(query, availableAreas) {

    const parsed = {
        bedrooms: null,
        bathrooms: null,
        maxRent: null,
        location: null,
        propertyType: null,
        amenities: [],
        nearPlace: null,
    }

    const lower =
        query.toLowerCase()

    // ─────────────────────────────
    // Bedrooms
    // ─────────────────────────────

    const bedroomMatch =
        lower.match(/(\d+)\s*bed/)

    if (bedroomMatch) {

        parsed.bedrooms =
            parseInt(bedroomMatch[1])
    }

    // ─────────────────────────────
    // Bathrooms
    // ─────────────────────────────

    const bathroomMatch =
        lower.match(/(\d+)\s*bath/)

    if (bathroomMatch) {

        parsed.bathrooms =
            parseInt(bathroomMatch[1])
    }

    // ─────────────────────────────
    // Budget
    // ─────────────────────────────

    const budgetMatch =
        lower.match(/under\s*(\d+)k?/)

    if (budgetMatch) {

        let amount =
            parseInt(budgetMatch[1])

        if (lower.includes("k")) {
            amount *= 1000
        }

        parsed.maxRent = amount
    }

    // ─────────────────────────────
    // Property Type
    // ─────────────────────────────

    const propertyTypes = [
        "apartment",
        "house",
        "hostel",
        "commercial",
    ]

    propertyTypes.forEach((type) => {

        if (lower.includes(type)) {

            parsed.propertyType = type
        }
    })

    // ─────────────────────────────
    // Dynamic Location Matching
    // ─────────────────────────────

    availableAreas.forEach((item) => {

        const area =
            item.area.toLowerCase()

        if (lower.includes(area)) {

            parsed.location =
                item.area
        }
    })

    // ─────────────────────────────
    // Nearby Place Detection
    // ─────────────────────────────

    const nearMatch =
        lower.match(
            /near\s+([a-zA-Z\s]+?)(?:\swith|\sunder|$)/
        )

    if (nearMatch) {

        parsed.nearPlace =
            nearMatch[1].trim()
    }

    // ─────────────────────────────
    // Amenities
    // ─────────────────────────────

    const amenities = [
        "parking",
        "wifi",
        "pool",
        "gym",
        "lift",
    ]

    amenities.forEach((amenity) => {

        if (lower.includes(amenity)) {

            parsed.amenities.push(amenity)
        }
    })

    return parsed
}

module.exports = parseSearchQuery