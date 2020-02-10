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

const getWebsiteContent = async (url) => {
    try {
      const response = await axios.get(url);

      if(response) {
        const $ = cheerio.load(response.data);

        var descricaoTarifa = "";
        var valorTransferencia = "";

        $("#tarifas-2 > .row").map((i, el) => {
          if(i === 2) {
            descricaoTarifa = $(el).children().eq(0).text();
            valorTransferencia = $(el).children().eq(2).text();
          }
        })

        getWebsiteContentExchange(descricaoTarifa, valorTransferencia);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWebsiteContentExchange = async (descricaoTarifa, valorTransferencia) => {

    try {
      const response = await axios.get(URL_EXCHANGE);

      retorno.dataConsulta = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
      retorno.descricaoTarifa = descricaoTarifa.trim();
      retorno.valorReal = parseFloat(valorTransferencia.replace('R$', '').replace(',', '.'));
      retorno.valorUSD = parseFloat(response.data.rates.USD).toFixed(2) * retorno.valorReal ;
      retorno.valorEUR = parseFloat(response.data.rates.EUR).toFixed(2) * retorno.valorReal ;
     
    } catch (error) {
      console.error(error);
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

      const url = urlSmartMEI.toLowerCase();

        if(!url.includes(HTTPS_URL_SMARTMEI) 
            && !url.includes(HTTP_URL_SMARTMEI)
              && url.includes(URL_SMARTMEI)) {
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