const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    category: Category!
    stock: Int!
  }

  type Category {
    id: ID!
    name: String!
    products: [Product!]!
  }

  type Order {
    id: ID!
    products: [Product!]!
    total: Float!
    status: String!
    user: User!
    createdAt: Date!
  }

  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Query {
    products(page: Int, pageSize: Int, filter: ProductFilter, sort: ProductSort): ProductConnection!
    categories: [Category!]!
    orders: [Order!]!
    me: User
  }

  input ProductFilter {
    category: ID
    priceMin: Float
    priceMax: Float
    text: String
  }

  input ProductSort {
    field: String
    order: String
  }

  type ProductConnection {
    edges: [Product!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    register(email: String!, password: String!): User!
    login(email: String!, password: String!): String!
  }

  input ProductInput {
    name: String!
    price: Float!
    category: ID!
    stock: Int!
    description: String
  }
`;

module.exports = typeDefs;
