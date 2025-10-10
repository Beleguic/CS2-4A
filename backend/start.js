const app = require('./server');

const server = app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});

module.exports = server;
