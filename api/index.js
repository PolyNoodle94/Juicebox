const express = require("express");
const apiRouter = express.Router();

apiRouter.use("/users", require("./users"));
apiRouter.use("/posts", require("./posts"));
apiRouter.use("/tags", require("./tags"));

module.exports = apiRouter;
