const Promise = require('bluebird');
const _ = require('lodash');
const uuid = require('uuid');

const indraStatementMap = require('./indra-statement-map');

const { INDRA_URL } = require('../../../../config');

let agentConverter = agentJSON => {
  let ent = {
    type: 'entity',
    id: uuid()
  };


  ent.name = agentJSON.name;

  if( _.has(agentJSON.db_refs, 'UP') ){
    ent.type = 'protein';
  } else {
    if ( _.has(agentJSON.db_refs, 'PUBCHEM') ){
      ent.type = 'chemical';
    } else {
      ent.type = 'unsupported';
    }
  }

  return ent;
};

let getIndraResults = text => fetch(INDRA_URL, {
  method: 'POST',
  body: (function(){
    let data = new FormData();

    data.append('text', text);

    return data;
  })()
});

module.exports = {
  get: function( text ){

    getIndraResults( text ).then( res => res.json() ).then( results => {
      let statements = results.statements;

      let elements = [];

      statements.forEach(statement => {
        let statementType = statement.type;
        let agentKeys = indraStatementMap(statementType).agents;

        agentKeys.forEach(agent => {
          let convertedAgent = agentConverter(agent);
          if (convertedAgent.type !== 'unsupported') {
            elements.push(agentConverter(agent));
          }
        });
      });

      return Promise.resolve({
        elements: elements,
        organisms: []
      });
    });
  }
};
