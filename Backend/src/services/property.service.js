const { v4: uuidv4 } = require("uuid")
const cloudinary = require("../config/cloudinary")
const {getPool} = require("../config/db")

async function createPropertyService(ownerId, body, files) {

    const pool = getPool()

    const {
        title,
        description,
        property_type,
        listing_type,
        total_units,
        monthly_rent,
        expected_security_deposit,
        total_bedrooms,
        total_bathrooms,
        property_size_sqft,
        division,
        district,
        area,
        address,
        latitude,
        longitude,
        available_from,
        amenities,
    } = body

    if (!title || !property_type || !monthly_rent || !division || !district || !area || !address) {
        const error = new Error("Required fields missing. Title, property type, monthly rent, division, district, local area, and detailed address are all required.")
        error.statusCode = 400
        throw error
    }

    // ─────────────────────────────────────────────
    // Insert property
    // ─────────────────────────────────────────────
const propertyId = uuidv4()

const [propertyResult] = await pool.query(
    `
    INSERT INTO properties (
        id,
        owner_id,
        title,
        description,
        property_type,
        listing_type,
        total_units,
        monthly_rent,
        expected_security_deposit,
        total_bedrooms,
        total_bathrooms,
        property_size_sqft,
        division,
        district,
        area,
        address,
        latitude,
        longitude,
        available_from
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
        propertyId,
        ownerId,
        title,
        description || null,
        property_type,
        listing_type || "full_property",
        total_units || 1,
        monthly_rent,
        expected_security_deposit || 0,
        total_bedrooms || 0,
        total_bathrooms || 0,
        property_size_sqft || null,
        division,
        district,
        area,
        address,
        latitude || null,
        longitude || null,
        available_from || null,
    ]
)

    // ─────────────────────────────────────────────
    // Upload images
    // ─────────────────────────────────────────────

    if (files && files.length > 0) {

        for (const file of files) {

            const uploaded = await new Promise((resolve, reject) => {

                cloudinary.uploader.upload_stream(
                    {
                        folder: "easyrentbd/properties",
                    },
                    (err, result) => {
                        if (err) reject(err)
                        else resolve(result)
                    }
                ).end(file.buffer)
            })

            await pool.query(
                `
                INSERT INTO property_images (
                    property_id,
                    image_url
                )
                VALUES (?, ?)
                `,
                [propertyId, uploaded.secure_url]
            )
        }
    }

    // ─────────────────────────────────────────────
    // Amenities
    // ─────────────────────────────────────────────

    if (amenities) {
        try {
            const parsedAmenities =
                typeof amenities === "string"
                    ? JSON.parse(amenities)
                    : amenities

            if (Array.isArray(parsedAmenities)) {
                for (const amenityId of parsedAmenities) {
                    await pool.query(
                        `
                        INSERT INTO property_amenities (
                            property_id,
                            amenity_id
                        )
                        VALUES (?, ?)
                        `,
                        [propertyId, amenityId]
                    )
                }
            }
        } catch (e) {
            console.error("Error parsing or inserting amenities:", e);
        }
    }

    return {
        id: propertyId,
        title,
    }
}

async function getAllPropertiesService() {

    const pool = getPool()

    const [properties] = await pool.query(
        `
        SELECT p.*,
               (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id LIMIT 1) as cover_image
        FROM properties p
        WHERE p.visibility_status = 'active'
        ORDER BY p.created_at DESC
        `
    )

    return properties
}

async function getPropertyByIdService(propertyId) {

    const pool = getPool()

    const [properties] = await pool.query(
        `
        SELECT p.*, u.name AS owner_name
        FROM properties p
        INNER JOIN users u ON p.owner_id = u.id
        WHERE p.id = ?
        `,
        [propertyId]
    )

    if (properties.length === 0) {
        const error = new Error("Property not found.")
        error.statusCode = 404
        throw error
    }

    const property = properties[0]

    const [images] = await pool.query(
        `
        SELECT image_url
        FROM property_images
        WHERE property_id = ?
        `,
        [propertyId]
    )

    const [amenities] = await pool.query(
        `
        SELECT a.id, a.name
        FROM amenities a
        INNER JOIN property_amenities pa
        ON a.id = pa.amenity_id
        WHERE pa.property_id = ?
        `,
        [propertyId]
    )

    property.images = images
    property.amenities = amenities

    return property
}

async function getOwnerPropertiesService(ownerId) {

    const pool = getPool()

    const [properties] = await pool.query(
        `
        SELECT p.*,
               (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id LIMIT 1) as cover_image
        FROM properties p
        WHERE p.owner_id = ?
        ORDER BY p.created_at DESC
        `,
        [ownerId]
    )

    return properties
}

async function deletePropertyService(propertyId, ownerId) {
    const pool = getPool()
    
    const [property] = await pool.query(
        `SELECT owner_id FROM properties WHERE id = ?`,
        [propertyId]
    )

    if (property.length === 0) {
        const error = new Error("Property not found.")
        error.statusCode = 404
        throw error
    }

    if (property[0].owner_id !== ownerId) {
        const error = new Error("Unauthorized to delete this property.")
        error.statusCode = 403
        throw error
    }

    await pool.query(
        `DELETE FROM properties WHERE id = ?`,
        [propertyId]
    )

    return { success: true }
}

async function updatePropertyService(propertyId, ownerId, body, files) {
    const pool = getPool()

    const [property] = await pool.query(
        `SELECT owner_id FROM properties WHERE id = ?`,
        [propertyId]
    )

    if (property.length === 0) {
        const error = new Error("Property not found.")
        error.statusCode = 404
        throw error
    }

    if (property[0].owner_id !== ownerId) {
        const error = new Error("Unauthorized to edit this property.")
        error.statusCode = 403
        throw error
    }

    const {
        title,
        description,
        property_type,
        listing_type,
        total_units,
        monthly_rent,
        expected_security_deposit,
        total_bedrooms,
        total_bathrooms,
        property_size_sqft,
        division,
        district,
        area,
        address,
        latitude,
        longitude,
        available_from,
        amenities,
    } = body

    if (!title || !property_type || !monthly_rent || !division || !district || !area || !address) {
        const error = new Error("Required fields missing.")
        error.statusCode = 400
        throw error
    }

    await pool.query(
        `
        UPDATE properties SET
            title = ?,
            description = ?,
            property_type = ?,
            listing_type = ?,
            total_units = ?,
            monthly_rent = ?,
            expected_security_deposit = ?,
            total_bedrooms = ?,
            total_bathrooms = ?,
            property_size_sqft = ?,
            division = ?,
            district = ?,
            area = ?,
            address = ?,
            latitude = ?,
            longitude = ?,
            available_from = ?
        WHERE id = ?
        `,
        [
            title,
            description || null,
            property_type,
            listing_type || "full_property",
            total_units || 1,
            monthly_rent,
            expected_security_deposit || 0,
            total_bedrooms || 0,
            total_bathrooms || 0,
            property_size_sqft || null,
            division,
            district,
            area,
            address,
            latitude || null,
            longitude || null,
            available_from || null,
            propertyId
        ]
    )

    if (files && files.length > 0) {
        await pool.query(`DELETE FROM property_images WHERE property_id = ?`, [propertyId])

        for (const file of files) {
            const uploaded = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "easyrentbd/properties" },
                    (err, result) => {
                        if (err) reject(err)
                        else resolve(result)
                    }
                ).end(file.buffer)
            })

            await pool.query(
                `INSERT INTO property_images (property_id, image_url) VALUES (?, ?)`,
                [propertyId, uploaded.secure_url]
            )
        }
    }

    if (amenities) {
        try {
            const parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities
            
            await pool.query(`DELETE FROM property_amenities WHERE property_id = ?`, [propertyId])

            if (Array.isArray(parsedAmenities)) {
                for (const amenityId of parsedAmenities) {
                    await pool.query(
                        `INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)`,
                        [propertyId, amenityId]
                    )
                }
            }
        } catch (e) {
            console.error("Error parsing or inserting amenities:", e);
        }
    }

    return { success: true }
}

module.exports = {
    createPropertyService,
    getAllPropertiesService,
    getPropertyByIdService,
    getOwnerPropertiesService,
    deletePropertyService,
    updatePropertyService,
}