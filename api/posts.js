const express = require("express");
const postsRouter = express.Router();

const {
  getAllPosts,
  createUser,
  createPost,
  updatePost,
  getPostById,
} = require("../db");
const { requireUser } = require("./utils");

postsRouter.use("/", (req, res, next) => {
  console.log("A request is being sent to /posts");

  next();
});

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData["authorId"] = req.user.id;
    postData["title"] = title;
    postData["content"] = content;

    const post = await createPost(postData);
    if (post) {
      res.send(post);
    } else {
      next({
        name: "PostCreationFailed",
        message: "Post failed to create",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.get("/", async (req, res, next) => {
  const posts = await getAllPosts();

  res.send(posts);
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  console.log("Starting patch request")
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
    console.log("Done with patch request")
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);
    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, {active:false});
      res.send({post: updatePost});
    } else{
      next(post ? {
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }
  } catch ({name, message}){
    next({name, message})
  }
})

module.exports = postsRouter;