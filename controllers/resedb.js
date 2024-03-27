const mongoose = require("mongoose");
const collections = mongoose.connection.collections;

const deleteData = async (req, res) => {
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  res.status(200).json({ msg: "database reseted succesfully" });
};
module.exports = {
  deleteData,
};