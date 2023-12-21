const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  cat_name: {
    type: String,
    required : true,
    unique: true
  },
  description: {
    type: String
  },
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref : "postsmodel1",
    }
  ]
});

const Category = mongoose.model('category', CategorySchema);

module.exports = Category;