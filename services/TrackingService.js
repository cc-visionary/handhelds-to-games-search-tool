const runQuery = require("../helpers/runQuery");

const TrackingService = {
    selectDevice: (deviceID) => {
        const search_query = `
            SELECT * FROM DeviceCounts WHERE DeviceID=?;
        `;
        const increment_query = `
            UPDATE DeviceCounts
            SET Count=?
            WHERE DeviceID=?
        `;
        const insert_query = `
            INSERT INTO DeviceCounts (DeviceID, Count)
            VALUES (?, 1)
        `;
        runQuery(search_query, [deviceID])
            .then((devices) => {
                if (devices.length == 0) {
                    runQuery(insert_query, [deviceID]);
                } else {
                    runQuery(increment_query, [
                        devices[0]["Count"] + 1,
                        deviceID,
                    ]);
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    },
    selectEmulator: (emulatorID) => {
        const search_query = `
            SELECT * FROM EmulatorCounts WHERE EmulatorID=?;
        `;
        const increment_query = `
            UPDATE EmulatorCounts
            SET Count=?
            WHERE EmulatorID=?
        `;
        const insert_query = `
            INSERT INTO EmulatorCounts (EmulatorID, Count)
            VALUES (?, 1)
        `;
        runQuery(search_query, [emulatorID])
            .then((emulators) => {
                if (emulators.length == 0) {
                    runQuery(insert_query, [emulatorID]);
                } else {
                    runQuery(increment_query, [
                        emulators[0]["Count"] + 1,
                        emulatorID,
                    ]);
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    },
    selectGame: (gameID) => {
        const search_query = `
            SELECT * FROM GameCounts WHERE GameID=?;
        `;
        const increment_query = `
            UPDATE GameCounts
            SET Count=?
            WHERE GameID=?
        `;
        const insert_query = `
            INSERT INTO GameCounts (GameID, Count)
            VALUES (?, 1)
        `;
        runQuery(search_query, [gameID])
            .then((games) => {
                if (games.length == 0) {
                    runQuery(insert_query, [gameID]);
                } else {
                    runQuery(increment_query, [games[0]["Count"] + 1, gameID]);
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    },
    selectDeviceCardEmulator: (deviceID, cardID, emulatorID) => {
        const search_query = `
            SELECT * FROM DeviceCardEmulatorCounts WHERE DeviceID=? AND CardID=? AND EmulatorID=?;
        `;
        const increment_query = `
            UPDATE DeviceCardEmulatorCounts
            SET Count=?
            WHERE DeviceID=? AND CardID=? AND EmulatorID=?
        `;
        const insert_query = `
            INSERT INTO DeviceCardEmulatorCounts (DeviceID, CardID, EmulatorID, Count)
            VALUES (?, ?, ?, 1)
        `;
        runQuery(search_query, [deviceID, cardID, emulatorID])
            .then((dce) => {
                if (dce.length == 0) {
                    runQuery(insert_query, [deviceID, cardID, emulatorID]);
                } else {
                    runQuery(increment_query, [
                        dce[0]["Count"] + 1,
                        deviceID,
                        cardID,
                        emulatorID,
                    ]);
                }
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    },
};

module.exports = TrackingService;
