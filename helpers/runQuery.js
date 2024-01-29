const db = require("../database/db");

// Function to run a query and return a promise
const runQuery = (query, params = null) =>
    new Promise((resolve, reject) => {
        if (params) {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map((row) => row));
            });
        } else {
            db.all(query, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map((row) => row));
            });
        }
    });

module.exports = runQuery;
