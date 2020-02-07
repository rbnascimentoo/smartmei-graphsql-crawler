var express = require('express');
var express_graphql = require('express-graphql');
const request = require('request');
const cheerio = require('cheerio');
var { buildSchema } = require('graphql');

// Schema
var schema = buildSchema(`
    type Query {
        startCrawler(nameHost: String!): Retorno
    }

    type Retorno {
        date: String,
        descricao: String,
        valorReal: Float,
        valorUSD: Float,
        valorEUR: Float
    }
`);

// Maps username to content
var retorno = {};

// Mapeamento
var root = {
    startCrawler: ({nameHost}) => {

        if(!nameHost.includes('smartmei.com.br')) {
            return retorno;
        }

        request(nameHost, function (err, res, body) {
            if(err) {
                console.log(err, "error occured while hitting URL");
            } else {
                console.log(body);
            }
        });

        //Teste
        retorno.date = '08/02/2020';

        return retorno;
    }
};

var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(3000, () => console.log('Express GraphQL Server Now Running On localhost:3000/graphql'));