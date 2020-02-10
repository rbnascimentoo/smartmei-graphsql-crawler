const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios');
const cheerio = require('cheerio');

const html = "";
const retorno = {};
const date = new Date();
const URL_EXCHANGE = "https://api.exchangeratesapi.io/latest?base=BRL";
const URL_SMARTMEI = "www.smartmei.com.br";
const HTTPS_URL_SMARTMEI = "https://www.smartmei.com.br";
const HTTP_URL_SMARTMEI = "http://www.smartmei.com.br";

const getWebsiteContent = (url) => {

  axios.get(url).then(function (response) {
      if(response) {
        const $ = cheerio.load(response.data);
        getWebsiteContentRetorn($);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  const getWebsiteContentRetorn = ($) => {
    axios.get(URL_EXCHANGE).then(function (response) {

      if(response) {
        const tarifas = $('#tarifas-2');

        const rows = $("row row-eq-height");

        // for (let i = 0; i < rows.length; i++) {

          console.log(rows[2])
        // }

        

        // console.log(tarifas);

        retorno.dataConsulta = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
        retorno.descricaoTarifa = "";
        retorno.valorReal = parseFloat(response.data.rates.BRL) * 7;
        retorno.valorUSD = parseFloat(response.data.rates.USD) * 7;
        retorno.valorEUR = parseFloat(response.data.rates.EUR) * 7;
        
      }       
    })
    .catch(function (error) {
      console.log("error " + error);
    });
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

        if(!urlSmartMEI.toLowerCase().includes(HTTPS_URL_SMARTMEI) 
            && !urlSmartMEI.toLowerCase().includes(HTTP_URL_SMARTMEI)
              && urlSmartMEI.toLowerCase().includes(URL_SMARTMEI)) {
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