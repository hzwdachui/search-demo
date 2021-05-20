// This is the search demo for using graphql api
import QueryComponent from './query.component';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import gql from "graphql-tag";

const httpLink = createHttpLink({
  uri: 'http://localhost:9100/graphql'
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

const PRODUCTS = gql`{
  products{
    name
    country
  }
}`;

function SearchDemo() {
  return (
      <ApolloProvider client={client}>
      <div>
          <h1>🚀 GraphQL / ApolloClient</h1>
          <ul>
              <QueryComponent query={PRODUCTS}></QueryComponent>
          </ul>
      </div>
  </ApolloProvider>
  );
}

export default SearchDemo;
