const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI .env faylda topilmadi.");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB ga muvaffaqiyatli ulanildi.");

    // Legacy / noto'g'ri movie id larni (movie1, undefined, ...) raqamga o'tkazish
    try {
      const { ensureMovieNumericIds } = require("../services/movieService");
      await ensureMovieNumericIds();
    } catch (repairError) {
      console.error("Movie ID repair xatosi:", repairError.message);
    }
  } catch (error) {
    console.error("MongoDB ulanishida xatolik:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
