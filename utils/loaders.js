const DataLoader = require('dataloader');
const Category = require('../models/Category');

const batchCategories = async (categoryIds) => {
  const categories = await Category.find({ _id: { $in: categoryIds } });
  return categoryIds.map(id => categories.find(c => c.id == id));
};

module.exports = {
  categoryLoader: () => new DataLoader(batchCategories)
};
