const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

require("dotenv").config();

const port = 3000 || process.env.PORT;
const router = require("./router");

const tokenMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token || token !== process.env.SECRET_TOKEN) {
        return res.status(403).json({ message: "Invalid or missing token" });
    }

    next();
};

app.use(cors());
app.use(morgan("tiny"));

app.use("/api", tokenMiddleware, router);

// Root endpoint
app.get("/", (req, res) => {
    res.json({ message: "API is working well" });
});

// Default response for any other request
app.use(function (req, res) {
    res.status(404);

    // default to plain-text. send()
    res.type("txt").send("Error 404: Not found");
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
