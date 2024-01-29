const runQuery = require("../helpers/runQuery");
const TrackingService = require("../services/TrackingService");

require("dotenv").config();
const itemsPerPage = 12 || process.env.ITEMS_PER_PAGE;

const DeviceController = {
    // Get all Devices
    getAllDevices: (req, res) => {
        const sql = "SELECT * FROM Devices";

        runQuery(sql)
            .then((devices) => {
                res.status(200).json(devices);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getDeviceByID: (req, res) => {
        const deviceID = req.params.deviceID;
        const sql = "SELECT * FROM Devices WHERE DeviceID=?";

        runQuery(sql, [deviceID])
            .then((devices) => {
                if (devices.length > 0) {
                    res.status(200).json(devices[0]);
                } else {
                    throw Error("DeviceID not found");
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getDeviceImageHandleByID: (req, res) => {
        const deviceID = req.params.deviceID;
        const sql = "SELECT ImageURL, Handle FROM Devices WHERE DeviceID=?";

        runQuery(sql, [deviceID])
            .then((devices) => {
                if (devices.length > 0) {
                    res.status(200).json(devices[0]);
                    TrackingService.selectDevice(deviceID);
                } else {
                    throw Error("DeviceID not found");
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getDeviceSizes: (req, res) => {
        const deviceID = req.params.deviceID;
        const sql = `
            SELECT SDCards.* FROM SDCards JOIN (
                SELECT DISTINCT CardID 
                FROM Links 
                WHERE DeviceID = ?
            ) AS Links ON SDCards.CardID=Links.CardID;
        `;

        runQuery(sql, [deviceID])
            .then((sdCards) => {
                res.status(200).json(sdCards);
                TrackingService.selectDevice(deviceID);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
    getDevicesByGames: (req, res) => {
        const games = req.query.games.split(",");
        const gameIDsPlaceholder = games.map(() => "?").join(",");
        const sql = `
            SELECT Devices.*, SDCards.CardSize, SDCards.CardBrand, Emulators.Emulator, GROUP_CONCAT(Games.Game) as Games 
            FROM Devices JOIN (
                SELECT *
                FROM Links 
                WHERE GameID IN (${gameIDsPlaceholder})
            ) AS Links ON Devices.DeviceID=Links.DeviceID
            JOIN SDCards ON SDCards.CardID=Links.CardID
            JOIN Emulators ON Emulators.EmulatorID=Links.EmulatorID
            JOIN Games ON Games.GameID=Links.GameID
            GROUP BY DeviceName, CardSize, CardBrand, Emulator
        `;

        runQuery(sql, [...games])
            .then((devices) => {
                combinations = {};
                devices.map((d) => {
                    const key = `${d.DeviceName}`;
                    let sdCard = "";

                    if (d.CardBrand) {
                        sdCard = `${d.CardSize} - ${d.CardBrand}`;
                    } else {
                        sdCard = `${d.CardSize}`;
                    }

                    if (Object.keys(combinations).includes(key)) {
                        if (
                            Object.keys(
                                combinations[key]["Emulators"]
                            ).includes(d.Emulator)
                        ) {
                            for (const g of d.Games.split(",")) {
                                if (
                                    !combinations[key]["Emulators"][
                                        d.Emulator
                                    ].includes(g)
                                ) {
                                    combinations[key]["Emulators"][
                                        d.Emulator
                                    ].push(g);
                                }
                            }
                        } else {
                            combinations[key]["Emulators"][d.Emulator] =
                                d.Games.split(",");
                        }

                        if (!combinations[key]["SDCards"].includes(sdCard)) {
                            combinations[key]["SDCards"].push(sdCard);
                        }
                    } else {
                        combinations[key] = {
                            DeviceName: d.DeviceName,
                            ImageURL: d.ImageURL,
                            Handle: d.Handle,
                            SDCards: [sdCard],
                            Emulators: {},
                        };
                        combinations[key]["Emulators"][d.Emulator] =
                            d.Games.split(",");
                    }
                });
                res.status(200).json(Object.values(combinations));
                // track last game in list
                TrackingService.selectGame(games[games.length - 1]);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    },
};

module.exports = DeviceController;
