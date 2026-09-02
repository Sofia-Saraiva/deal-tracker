const cron = require("node-cron");
const express = require("express");

const app = express();

cron.schedule("0 8 * * *", () => {
    sendEmail();
});

app.listen(1313);