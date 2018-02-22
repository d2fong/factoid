const Promise = require('bluebird');

const { INDRA_URL } = require('../../../../config');



module.exports = {
  get: function( text ){
    let makeRequest = () => fetch(INDRA_URL, {
      method: 'POST',
      body: (function(){
        let data = new FormData();

        data.append('text', text);

        return data;
      })()
    });
    return Promise.resolve({
      elements: [],
      organisms: []
    });
  }
};
