const { success } = require("../utils/apiResponse");
const MovieComment = require("../models/movieComment");
const { registerMovieView, toMovieId } = require("../utils/movieViews");
const toReaction = (value) => (value === "like" || value === "dislike" ? value : null);

const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    return success(res, {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar || null,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, avatar } = req.body || {};

    if (typeof firstName === "string") req.user.firstName = firstName.trim();
    if (typeof lastName === "string") req.user.lastName = lastName.trim();
    if (avatar !== undefined) req.user.avatar = avatar || null;

    await req.user.save();

    const authorName = [req.user.firstName, req.user.lastName].filter(Boolean).join(" ").trim() || "User";
    await MovieComment.updateMany(
      { authorId: req.user._id },
      {
        $set: {
          authorName,
          authorAvatar: req.user.avatar || null,
        },
      }
    );

    return success(res, {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      avatar: req.user.avatar || null,
    }, "Profil muvaffaqiyatli yangilandi.");
  } catch (error) {
    return next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = Array.isArray(req.user.wishlist) ? req.user.wishlist : [];
    return success(res, { wishlist }, "Wishlist olindi.");
  } catch (error) {
    return next(error);
  }
};

const addWishlistItem = async (req, res, next) => {
  try {
    const movieId = toMovieId(req.body?.movieId);
    if (movieId === null) {
      const error = new Error("movieId noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }

    const current = Array.isArray(req.user.wishlist) ? req.user.wishlist : [];
    if (!current.includes(movieId)) {
      req.user.wishlist = [...current, movieId];
      await req.user.save();
    }

    return success(res, { wishlist: req.user.wishlist }, "Wishlistga qo'shildi.");
  } catch (error) {
    return next(error);
  }
};

const removeWishlistItem = async (req, res, next) => {
  try {
    const movieId = toMovieId(req.params?.movieId);
    if (movieId === null) {
      const error = new Error("movieId noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }

    const current = Array.isArray(req.user.wishlist) ? req.user.wishlist : [];
    req.user.wishlist = current.filter((id) => id !== movieId);
    await req.user.save();

    return success(res, { wishlist: req.user.wishlist }, "Wishlistdan olib tashlandi.");
  } catch (error) {
    return next(error);
  }
};

const getMovieReaction = async (req, res, next) => {
  try {
    const movieId = toMovieId(req.params?.movieId);
    if (movieId === null) {
      const error = new Error("movieId noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }
    const reaction = req.user.movieReactions?.get(String(movieId)) || null;
    return success(res, { reaction }, "Movie reaction olindi.");
  } catch (error) {
    return next(error);
  }
};

const setMovieReaction = async (req, res, next) => {
  try {
    const movieId = toMovieId(req.body?.movieId);
    const reaction = toReaction(req.body?.reaction);
    if (movieId === null || !reaction) {
      const error = new Error("movieId yoki reaction noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }
    req.user.movieReactions.set(String(movieId), reaction);
    await req.user.save();
    return success(res, { reaction }, "Movie reaction saqlandi.");
  } catch (error) {
    return next(error);
  }
};

const removeMovieReaction = async (req, res, next) => {
  try {
    const movieId = toMovieId(req.params?.movieId);
    if (movieId === null) {
      const error = new Error("movieId noto'g'ri.");
      error.statusCode = 400;
      throw error;
    }
    req.user.movieReactions.delete(String(movieId));
    await req.user.save();
    return success(res, { reaction: null }, "Movie reaction olib tashlandi.");
  } catch (error) {
    return next(error);
  }
};

const getViewedMovies = async (req, res, next) => {
  try {
    const viewedMovies = Array.isArray(req.user.viewedMovies) ? req.user.viewedMovies : [];
    return success(res, { viewedMovies }, "Ko'rilgan kinolar olindi.");
  } catch (error) {
    return next(error);
  }
};

const addViewedMovie = async (req, res, next) => {
  try {
    const { viewedMovies } = await registerMovieView({
      user: req.user,
      movieId: req.body?.movieId,
    });
    return success(res, { viewedMovies }, "Ko'rilgan kino saqlandi.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  getMovieReaction,
  setMovieReaction,
  removeMovieReaction,
  getViewedMovies,
  addViewedMovie,
};
