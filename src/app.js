//imports
const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios');
const cheerio = require('cheerio');

//Constants
const retorno = {};
const date = new Date();
const URL_EXCHANGE = "https://api.exchangeratesapi.io/latest?base=BRL";
const URL_SMARTMEI = "www.smartmei.com.br";
const HTTPS_URL_SMARTMEI = "https://www.smartmei.com.br";
const HTTP_URL_SMARTMEI = "http://www.smartmei.com.br";

/**
  * Método que realiza o crawler na url passada
  * Buscando o valor atual de uma Transferência do Plano Profissional no site da SmartMei
  * 
  *  @param {*} url 
*/
const obterInformacoesCrawler = async (urlSmartMEI) => {
    try {
      const response = await axios.get(urlSmartMEI);

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

        obterInformacoesCambio(descricaoTarifa, valorTransferencia);
      }

    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Método que chama uma API aberta (https://api.exchangeratesapi.io) que 
   * converta esse preço para USD (dolar americano) e EUR (Euro)
   * 
   * @param {*} descricaoTarifa 
   * @param {*} valorTransferencia 
   */
  const obterInformacoesCambio = async (descricaoTarifa, valorTransferencia) => {

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

/** Serviço GraphQL */
var schema = buildSchema(`
    type Query {
        iniciarCrawlerSmartMEI(url: String!): Retorno
    }

    type Retorno {
        dataConsulta: String,
        descricaoTarifa: String,
        valorReal: Float,
        valorUSD: Float,
        valorEUR: Float
    }
`);

/** Serviço GraphQL */
var root = {
  iniciarCrawlerSmartMEI: ({url}) => {

        const urlParam = url.toLowerCase();

        //Valida URL
        if(!urlParam.includes(HTTPS_URL_SMARTMEI) 
            && !urlParam.includes(HTTP_URL_SMARTMEI)
              && urlParam.includes(URL_SMARTMEI)) {
          return retorno;
        }

        obterInformacoesCrawler(urlParam);
    
      return retorno;
    }
};

/**  
 * Server App com GraphSql rodando na porta 3000
*/
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(3000, () => console.log('Express GraphQL Server Now Running On localhost:3000/graphql'));