const runQuery = require("../helpers/runQuery");
const TrackingService = require("../services/TrackingService");

require("dotenv").config();
const itemsPerPage = 12 || process.env.ITEMS_PER_PAGE;

const GameController = {
    // Get all Games
    getAllGames: (req, res) => {
        const sql = "SELECT * FROM Games";

        runQuery(sql)
            .then((games) => {
                res.status(200).json(games);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getGameByID: (req, res) => {
        const gameID = req.params.gameID;
        const sql = "SELECT * FROM Games WHERE GameID=?";

        runQuery(sql, [gameID])
            .then((games) => {
                if (games.length > 0) {
                    res.status(200).json(games[0]);
                    // track this game
                } else {
                    throw Error("GameID not found");
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getGamesCountByDeviceCardEmulator: (req, res) => {
        const deviceID = req.query.deviceID;
        const cardID = req.query.cardID;
        const emulatorID = req.query.emulatorID;
        const search = req.query.search;

        let sql = `
            SELECT COUNT(*) as Count FROM Games
            JOIN (
                SELECT GameID 
                FROM Links 
                WHERE DeviceID=? AND CardID=? AND EmulatorID=?
            ) AS Links ON Games.GameID=Links.GameID;
        `;

        // track this device - card - emulator

        if (search && search.trim() != "") {
            sql = `
                SELECT COUNT(*) as Count FROM Games
                JOIN (
                    SELECT GameID 
                    FROM Links 
                    WHERE DeviceID=? AND CardID=? AND EmulatorID=?
                ) AS Links ON Games.GameID=Links.GameID
                WHERE Games.Game LIKE "${search}%";
            `;
        }

        runQuery(sql, [deviceID, cardID, emulatorID])
            .then((games) => {
                res.status(200).json(games);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getGamesPerPageByDeviceCardEmulator: (req, res) => {
        const deviceID = req.query.deviceID;
        const cardID = req.query.cardID;
        const emulatorID = req.query.emulatorID;
        const pageNum = req.query.pageNum;
        const search = req.query.search;

        let sql = `
            SELECT Games.* FROM Games
            JOIN (
                SELECT GameID 
                FROM Links 
                WHERE DeviceID=? AND CardID=? AND EmulatorID=?
            ) AS Links ON Games.GameID=Links.GameID
            ORDER BY Games.Game;
        `;

        if (search && search.trim() != "") {
            sql = `
                SELECT Games.* FROM Games
                JOIN (
                    SELECT GameID 
                    FROM Links 
                    WHERE DeviceID=? AND CardID=? AND EmulatorID=?
                ) AS Links ON Games.GameID=Links.GameID
                WHERE Games.Game LIKE "${search}%"
                ORDER BY Games.Game;
            `;
        }

        const start = (pageNum - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        runQuery(sql, [deviceID, cardID, emulatorID])
            .then((games) => {
                res.status(200).json(games.slice(start, end));
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
};

module.exports = GameController;
