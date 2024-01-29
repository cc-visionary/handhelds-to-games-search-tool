const runQuery = require("../helpers/runQuery");
const TrackingService = require("../services/TrackingService");

require("dotenv").config();
const itemsPerPage = 12 || process.env.ITEMS_PER_PAGE;

const EmulatorController = {
    // Get all Emulators
    getAllEmulators: (req, res) => {
        const sql = "SELECT * FROM Emulators";

        runQuery(sql)
            .then((emulators) => {
                res.status(200).json(emulators);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getEmulatorByDeviceCount: (req, res) => {
        const deviceID = req.query.deviceID;
        const cardID = req.query.cardID;
        const sql = `
            SELECT COUNT(*) as Count FROM Emulators JOIN (
                SELECT DISTINCT EmulatorID 
                FROM Links 
                WHERE DeviceID = ? AND CardID = ?
            ) AS Links ON Emulators.EmulatorID=Links.EmulatorID;
        `;

        runQuery(sql, [deviceID, cardID])
            .then((emulators) => {
                res.status(200).json(emulators);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    // Get all Emulators from Device
    getEmulatorsByDevicePerPage: (req, res) => {
        const deviceID = req.query.deviceID;
        const cardID = req.query.cardID;
        const pageNum = req.query.pageNum;
        const sql = `
            SELECT Emulators.*, Links.NumOfGames FROM Emulators JOIN (
                SELECT EmulatorID, COUNT(GameID) as NumOfGames
                FROM Links 
                WHERE DeviceID = ? AND CardID = ?
                GROUP BY EmulatorID
            ) AS Links ON Emulators.EmulatorID=Links.EmulatorID 
            ORDER BY Emulators.Emulator;
        `;

        const start = (pageNum - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        runQuery(sql, [deviceID, cardID])
            .then((emulators) => {
                res.status(200).json(emulators.slice(start, end));
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
};

module.exports = EmulatorController;
