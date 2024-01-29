const express = require("express");
const router = express.Router();

const DeviceController = require("./controllers/DeviceController");
const EmulatorController = require("./controllers/EmulatorController");
const GameController = require("./controllers/GameController");
const SearchController = require("./controllers/SearchController");

/* Devices API */
// Retrieve all Devices
// router.get("/devices", DeviceController.getAllDevices);
// Get Device by DeviceID
router.get("/devices/id/:deviceID", DeviceController.getDeviceByID);
// Get Device ImageURL and Handle
router.get(
    "/devices/image/:deviceID",
    DeviceController.getDeviceImageHandleByID
);
// Get SDCards by Device
router.get("/devices/sdcards/:deviceID", DeviceController.getDeviceSizes);
// Get Device by Games
router.get("/devices/games", DeviceController.getDevicesByGames);

/* Emulators API */
// Retrieve all Emulators
// router.get("/emulators", EmulatorController.getAllEmulators);

// Retrieve Count of Emulators for specific DeviceID and SDCardID
router.get(
    "/emulators/device/count",
    EmulatorController.getEmulatorByDeviceCount
);

// Retrieve Emulator by Devices Per Page
router.get("/emulators/device", EmulatorController.getEmulatorsByDevicePerPage);

/* Games API */
// Retrieve all Games
// router.get("/games", GameController.getAllGames);
// Get Device by DeviceID
router.get("/games/id/:gameID", GameController.getGameByID);
// Retrieve Count of Games for specific DeviceID, SDCardID, and EmulatorID
router.get("/games/count", GameController.getGamesCountByDeviceCardEmulator);
// Retrieve Page of Games for specific DeviceID, SDCardID, and EmulatorID
router.get("/games", GameController.getGamesPerPageByDeviceCardEmulator);

/* Search API */
// AutoComplete
router.get("/search/autocomplete", SearchController.autocompleteSearch);

module.exports = router;
