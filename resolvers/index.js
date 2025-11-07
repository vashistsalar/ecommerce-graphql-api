const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const { Product, Category, Order, User } = require('../models');

const { validateProductInput, validateRegisterInput } = require('../utils/validation');

module.exports = {
  Query: {
    products: async (_, { page = 1, pageSize = 10, filter, sort }) => {
      const query = {};
      if (filter) {
        if (filter.category) query.category = filter.category;
        if (filter.priceMin !== undefined) query.price = { ...query.price, $gte: filter.priceMin };
        if (filter.priceMax !== undefined) query.price = { ...query.price, $lte: filter.priceMax };
        if (filter.text) query.name = new RegExp(filter.text, "i");
      }
      let sortObj = {};
      if (sort) sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;

      const skip = (page - 1) * pageSize;
      const products = await Product.find(query).sort(sortObj).skip(skip).limit(pageSize + 1);
      const hasNextPage = products.length > pageSize;

      return {
        edges: hasNextPage ? products.slice(0, pageSize) : products,
        pageInfo: {
          hasNextPage,
          endCursor: "", // Add cursor if needed
        },
      };
    },
    categories: async () => Category.find(),
    orders: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return Order.find({ user: user.id });
    },
    me: (_, __, { user }) => user,
  },
  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      if (!user || user.role !== "admin") throw new AuthenticationError('Not authorized');
      await validateProductInput(input);
      const product = new Product(input);
      return product.save();
    },
    updateProduct: async (_, { id, input }, { user }) => {
      if (!user || user.role !== "admin") throw new AuthenticationError('Not authorized');
      await validateProductInput(input);
      return Product.findByIdAndUpdate(id, input, { new: true });
    },
    deleteProduct: async (_, { id }, { user }) => {
      if (!user || user.role !== "admin") throw new AuthenticationError('Not authorized');
      await Product.findByIdAndDelete(id);
      return true;
    },
    register: async (_, { email, password }) => {
      await validateRegisterInput({ email, password });
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashed });
      await user.save();
      return user;
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new UserInputError('Invalid credentials');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UserInputError('Invalid credentials');
      return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    }
  },
  Category: {
    products: (parent) => Product.find({ category: parent.id }),
  },
  Order: {
    products: (parent) => Product.find({ _id: { $in: parent.products } }),
    user: (parent) => User.findById(parent.user),
  },
  Product: {
    category: (parent) => Category.findById(parent.category),
  }
};
