require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schemas/typeDefs');
const resolvers = require('./resolvers');
const { getUserFromToken } = require('./utils/auth');

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || '';
    const user = await getUserFromToken(token.replace('Bearer ', ''));
    return { user };
  },
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Important: Start ApolloServer and apply middleware
    await server.start();
    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
      console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

start();
