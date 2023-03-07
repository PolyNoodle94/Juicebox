const express = require("express");
const tagsRouter = express.Router();
const {getPostsByTagName} = require("../db")

const { getAllTags } = require("../db");

tagsRouter.use("/", (req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", async (req, res, next) => {
  const tags = await getAllTags();

  res.send({ tags });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  const tag = req.params['posts'];
  try{
    const posts = await getPostsByTagName(tag);
    res.send({posts})
  } catch ({name, message}){
    next ({name, message});
  }
})

module.exports = tagsRouter;
