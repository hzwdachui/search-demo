import React, { Component } from 'react';

import { Query } from "react-apollo";
import gql from "graphql-tag";

const PRODUCTS = gql`{
  products {
    name
  }
}`;

export default class AppComponent extends Component {
  render() {
    return (
      <Query query={PRODUCTS}>
        {
          ({ loading, error, data }) => (
            loading 
              ? (<>Loading...</>) 
              : (
                <ul>{
                  data.products && _.map(data.products, (item, i) =>{
                    return (
                      <li key={i}>{
                        _.map(_.keys(item), (key, j) =>
                          key !== '__typename' && <span>{item[key]}<br /></span>
                        )
                      }</li>
                    );
                  })
                }</ul>
              )
          )
        }
      </Query>
    );
  }
}