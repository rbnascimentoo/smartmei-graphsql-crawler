const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios')
const cheerio = require('cheerio');

const html = "";
const retorno = {};
const date = new Date();
const URL_EXCHANGE = "https://api.exchangeratesapi.io/latest?base=BRL";

const getWebsiteContent = async (url) => {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      getWebsiteContentRetorn($);
  
    } catch (error) {
      console.error(error)
    }
  };

  const getWebsiteContentRetorn = async ($) => {
    try {
        const response = await axios.get(URL_EXCHANGE);

        const channelList = $('#tarifas-2');

        console.log(channelList);

        retorno.dataConsulta = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
        retorno.descricaoTarifa = "";
        retorno.valorReal = parseFloat(response.data.rates.BRL) * 7;
        retorno.valorUSD = parseFloat(response.data.rates.USD) * 7;
        retorno.valorEUR = parseFloat(response.data.rates.EUR) * 7;
  
    } catch (error) {
      console.error(error)
    }
  };

// Schema
var schema = buildSchema(`
    type Query {
        startCrawlerSmartMEI(urlSmartMEI: String!): Retorno
    }

    type Retorno {
        dataConsulta: String,
        descricaoTarifa: String,
        valorReal: Float,
        valorUSD: Float,
        valorEUR: Float
    }
`);

var root = {
    startCrawlerSmartMEI: ({urlSmartMEI}) => {

        if(!urlSmartMEI.includes('https://www.smartmei.com.br') && !urlSmartMEI.includes('http://www.smartmei.com.br')) {
            return retorno;
        }

        getWebsiteContent(urlSmartMEI);
    
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