const db = require("../database/db");

const runQuery = require("../helpers/runQuery");

const scoreSuggestion = (id, suggestion, searchTerm) => {
    let score = 0;

    switch (id.slice(0, -5)) {
        case "DEVICE":
            score += 50;
            break;
        case "EMULATOR":
            score += 30;
            break;
        case "GAME":
            score += 10;
            break;
    }

    // Convert both to lower case for case-insensitive comparison
    const lowerSuggestion = suggestion.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Check if suggestion starts with the search term
    if (lowerSuggestion.startsWith(lowerSearchTerm)) {
        score += 50; // Starting match has a high score
    }

    // Check the position of the search term in the suggestion
    const position = lowerSuggestion.indexOf(lowerSearchTerm);
    if (position > -1) {
        score += 40 - position * 2; // Decrease score as position moves away from start
    }
    // Length of the match as a percentage of the suggestion length
    // Longer matches relative to the length of the suggestion score higher
    const matchLengthScore =
        (lowerSearchTerm.length / lowerSuggestion.length) * 30;
    score += matchLengthScore;

    // Ensuring the score does not go negative
    return Math.max(score, 0);
};

const LinkController = {
    autocompleteSearch: (req, res) => {
        const limit = 10;
        const searchInput = req.query.input;
        const filterGames = req.query.filterGames;
        const searchQuery = "%" + searchInput + "%";
        let games = [];
        if (filterGames != null && filterGames.trim() != "") {
            games = filterGames.split(",");
        }

        // Prepare SQL queries for each category
        const deviceNameCol = "DeviceName";
        const devicesQuery = `SELECT * FROM Devices WHERE ${deviceNameCol} LIKE ? LIMIT ?;`;

        const emulatorNameCol = "Emulator";
        const emulatorsQuery = `SELECT * FROM Emulators WHERE ${emulatorNameCol} LIKE ? LIMIT ?;`;

        const gameNameCol = "Game";
        const gamesQuery = `SELECT * FROM Games WHERE ${gameNameCol} LIKE ? LIMIT ?;`;
        const gamesOnlyQuery = `SELECT * FROM Games WHERE ${gameNameCol} LIKE ? AND GameID NOT IN (${games
            .map(() => "?")
            .join(",")}) LIMIT ?;`;

        if (games.length > 0) {
            // Run queries in parallel and aggregate results
            Promise.all([
                runQuery(gamesOnlyQuery, [searchQuery, ...games, limit]),
            ])
                .then(([games]) => {
                    const combinedResults = [
                        ...games.map((game) => ({
                            id: game.GameID,
                            name: game.Game,
                            imageURL: game.ImageURL,
                            score: scoreSuggestion(
                                game.GameID,
                                game.Game,
                                searchInput
                            ),
                        })),
                    ];

                    res.json(
                        combinedResults
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)
                            .map((dict) => [dict.id, dict.name, dict.imageURL])
                    );
                })
                .catch((err) => {
                    console.error("Error fetching data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        } else {
            // Run queries in parallel and aggregate results
            Promise.all([
                runQuery(devicesQuery, [searchQuery, limit]),
                // runQuery(emulatorsQuery, [searchQuery, limit]),
                runQuery(gamesQuery, [searchQuery, limit]),
            ])
                .then(([devices, games]) => {
                    // .then(([devices, emulators, games]) => {
                    const combinedResults = [
                        ...devices.map((device) => ({
                            id: device.DeviceID,
                            name: device.DeviceName,
                            imageURL: device.ImageURL,
                            score: scoreSuggestion(
                                device.DeviceID,
                                device.DeviceName,
                                searchInput
                            ),
                        })),
                        // ...emulators.map((emulator) => ({
                        //     id: emulator.EmulatorID,
                        //     name: emulator.Emulator,
                        //     imageURL: emulator.ImageURL,
                        //     score: scoreSuggestion(
                        //         emulator.EmulatorID,
                        //         emulator.Emulator,
                        //         searchInput
                        //     ),
                        // })),
                        ...games.map((game) => ({
                            id: game.GameID,
                            name: game.Game,
                            imageURL: game.ImageURL,
                            score: scoreSuggestion(
                                game.GameID,
                                game.Game,
                                searchInput
                            ),
                        })),
                    ];

                    res.json(
                        combinedResults
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)
                            .map((dict) => [dict.id, dict.name, dict.imageURL])
                    );
                })
                .catch((err) => {
                    console.error("Error fetching data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        }
    },
    // autosuggest for games of specific device, card, and emulator (filter games based on search)
};

module.exports = LinkController;
