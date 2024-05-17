const express = require('express');
const { fetchPosts, fetchImages } = require('./posts.service');
const { fetchUserById } = require('../users/users.service');

const router = express.Router();

router.get('/', async (req, res) => {
  const { searchParams } = new URL(
    req.originalUrl,
    `http://${req.headers.host}`,
  );
  const start = searchParams.get('start');
  const limit = searchParams.get('limit');
  try {
    const posts = await fetchPosts({ start, limit });
    const userPromises = posts.map(post => fetchUserById(post.userId));
    const promiseImg = posts.map(post => fetchImages(post.id));
    const imagesData = await Promise.all(promiseImg);
    const userData = await Promise.all(userPromises);
    const postsWithImages = posts.map((post, index) => ({
      ...post,
      images: imagesData[index],
    }));
    const imageAndUser = postsWithImages.map((post, index) => ({
      ...post,
      user: userData[index],
    }));

    res.json(imageAndUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
