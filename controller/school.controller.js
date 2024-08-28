const pool = require('../database/index')

const schoolController = {
    getAll: async (req, res) => {
        try {
            const [rows, fields] = await pool.query('SELECT * FROM schools');
            res.json({ data: rows });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    create: async (req, res) => {
        try {
            const { name, address, latitude, longitude } = req.body;

            // Validate that all fields are provided
            if (!name || !address || !latitude || !longitude) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Validate that latitude and longitude are in decimal format
            const isLatitudeValid = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/.test(latitude);
            const isLongitudeValid = /^-?(([-+]?([1-9]?\d|1[0-7]\d))(\.\d+)?|180(\.0+)?)$/.test(longitude);

            if (!isLatitudeValid || !isLongitudeValid) {
                return res.status(400).json({ message: "Latitude and Longitude must be in decimal format" });
            }

            // Check if a school with the same name already exists
            const checkNameSql = "SELECT COUNT(*) as count FROM schools WHERE name = ?";
            const [nameCheckResult] = await pool.query(checkNameSql, [name]);

            if (nameCheckResult[0].count > 0) {
                return res.status(400).json({ message: "School name already taken" });
            }

            // Insert the new school
            const sql = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
            const [result] = await pool.query(sql, [name, address, latitude, longitude]);

            res.status(201).json({
                message: "School created successfully",
                data: { id: result.insertId, name, address, latitude, longitude }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server Error" });
        }
    },

    listSchools: async (req, res) => {
        try {
            const { latitude, longitude } = req.query;

            // Validate that latitude and longitude are provided
            if (!latitude || !longitude) {
                return res.status(400).json({ message: "Latitude and Longitude are required" });
            }

            // Validate that latitude and longitude are in decimal format
            const isLatitudeValid = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/.test(latitude);
            const isLongitudeValid = /^-?(([-+]?([1-9]?\d|1[0-7]\d))(\.\d+)?|180(\.0+)?)$/.test(longitude);

            if (!isLatitudeValid || !isLongitudeValid) {
                return res.status(400).json({ message: "Latitude and Longitude must be in decimal format" });
            }

            // Fetch all schools from the database
            const sql = "SELECT * FROM schools";
            const [rows, fields] = await pool.query(sql);

            // Calculate the distance between the user's coordinates and each school's coordinates
            const schoolsWithDistance = rows.map((school) => {
                const distance = calculateDistance(latitude, longitude, school.latitude, school.longitude);
                return { ...school, distance };
            });

            // Sort the schools by distance
            schoolsWithDistance.sort((a, b) => a.distance - b.distance);

            res.json({ data: schoolsWithDistance });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server Error" });
        }
    },
};

// Function to calculate the distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = schoolController;
