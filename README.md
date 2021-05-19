[toc]

# 部署es服务

使用 docker 部署一个 本地 elastic + kibana 服务

``file_elastic_kibana_latest.yml``

```yml
version: '3.1'
services:
  kibana:
     image: docker.elastic.co/kibana/kibana:7.3.0
     ports:
         - 5601:5601
         
  elasticsearch:
     environment:
            - "discovery.type=single-node"
            - "MAX_CLAUSE_COUNT=4096"
            - "ES_JAVA_OPTS=-Xms512m -Xmx512m" 
     image: docker.elastic.co/elasticsearch/elasticsearch:7.3.0
     ports:
         - 9200:9200
```

```shell
# 执行命令
docker-composer -f ./file_elastic_kibana_latest.yml up
```



## kibana

http://localhost:5601/app/kibana



# SearchBar

elastic searchbar 官方教程：https://github.com/elastic/search-ui

用户端实现搜索功能的话建议直接用 elastic 提供的 elastic search ui，我们只需要根据需求重写结果展现的方法即可



elastic search  服务的话有两种方式，一种是 elastic search 提供部署，一种是自己部署

第二种方法更复杂一点，需要自己实现 connector

- 方法一demo：https://github.com/elastic/search-ui
- 方法二demo：https://github.com/elastic/search-ui/tree/master/examples/elasticsearch

方法二更符合我们的需求



notes：实现 connector and handler

https://github.com/elastic/search-ui/blob/master/ADVANCED.md#connectors-and-handlers



## 流程

- 将页面请求转化成 elastic search 请求 ``buildRequest.js``
- 请求 elastic search ``runRequest.js``
- 将 elastic search 结果转化到页面展示  ``buildStates.js``



notes:

- demo中使用了 netlify 做转发，我觉得没有必要，且增加了复杂度，删除了
- 线下环境 将 ``package.json`` 中 ``proxy``  设置成本地 elastic search 端口，不然会报 CORS 错误



## 功能

- 搜索并展示结果
- 自动填充
- 搜索历史
- 高级搜索
  - filter
  - 排序



## 使用

```shell
npm start
```



## todo

- 根据我们自己的数据做改造（filter，排序等）
- 改造搜索结果的渲染
- 此demo存在bug：手机ui可以直接渲染出高级搜索菜单，PC ui需要请求一次才可以



# Elastic Search 结合 Graphql

## 设计

参考：

https://medium.com/@andrewrymaruk/elasticsearch-graphql-react-node-express-how-cb2c2cc708f8

https://github.com/rymaruk/app-react-graphql-elasticsearchjs

https://javascript.plainenglish.io/apollo-graphql-react-what-could-be-easier-bf34fbaed0c7

GraphQL + ES

目标：通过 GraphQL 实现对 ES 内容的增删改查



## 实现

### 连接ES

```javascript
/**
 * server.client.js
 */
const ElasticSearch = require('elasticsearch');

/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const client = new ElasticSearch.Client({
  hosts: ['http://127.0.0.1:9200']
});

module.exports = client;
```



### apollo server

``server.js``

提供 graphql 端口，且后端由 elastic search 支持



### apollo resolver

``server.graphql.js``

构建schema：客户端可以读写的数据类型

resolver选用 elastic search



### apollo provider

```javascript
import { ApolloProvider } from 'react-apollo';
```

此组件表示使用 apollo 服务



### 通过 graphql 语法查询

```javascript
// query.component.js
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
```

```javascript
// SearchDemo.js
import React, { Component } from 'react';
import { Query } from "react-apollo";
import _ from 'lodash';


// this component shows search result
export default class QueryComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Query query={this.props.query}>
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
```



### 通过 graphql 语法更新

https://www.apollographql.com/docs/react/data/mutations/



## 使用

1. 启动 elastic search 服务
2. 在 ``server.client.js ``中配置 elastic search server
3. 启动 graphql 服务(apollo server): ``node search_server/server.js``



```shell
# 启动 apollo server，提供一个 graphql 接口 localhost:port/graphql
node server.js
# 启动 app
npm start
```

验证：访问 http://localhost:9100/graphql 能通过 graphql 语法增删改查



