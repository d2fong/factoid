const fetch = require('node-fetch');
const Promise = require('bluebird');
const querystring = require('querystring');
const _ = require('lodash');
const Organism = require('../../../../model/organism');
const LRUCache = require('lru-cache');
const { memoize } = require('../../../../util');

const { UNIPROT_CACHE_SIZE, UNIPROT_URL } = require('../../../../config');

const BASE_URL = UNIPROT_URL;
const COLUMNS = 'id,organism-id,entry+name,genes,protein+names';

const isEmpty = str => str == null || str === '';

const clean = obj => _.omitBy( obj, _.isNil );

const param = ( name, value ) => {
  if( isEmpty(value) || value === '"undefined"' || value === '"null"' ){ return null; }

  if( name === '' ){ return value; }

  return `${name}:${value}`;
};

const searchQuery = opts => clean({
  query: [
    '(' + [
      param('name', `"${opts.name}"`),
      param('gene', `"${opts.name}"`),
      param('accession', `"${opts.name}"`),
      param('accession', `"${opts.id}"`)
    ].filter( p => !_.isNil(p) ).join('+OR+') + ')',
    (() => {
      let orgs = opts.organism;
      let ids;

      if( orgs == null || orgs === '' ){
        ids = Organism.ALL.map( org => org.id() );
      } else {
        ids = orgs.split(',');
      }

      return '(' + ids.map( id => param('organism', id) ).join('+OR+') + ')';
    })()
  ].filter( p => !_.isNil(p) ).join('+AND+'),
  limit: opts.limit,
  offset: opts.offset,
  sort: 'score',
  format: 'tab',
  columns: COLUMNS
});

const parseProteinNames = str => {
  let lvl = 0;
  let i0 = 0;
  let i;
  let names = [];

  for( i = 0; i < str.length; i++ ){
    if( str[i] === '(' ){
      if( names.length === 0 && lvl === 0 ){
        names.push( str.substring(i0, i - 1) );

        i0 = i - 2;
      }

      lvl++;
    } else if( str[i] === ')' ){
      lvl--;

      if( lvl === 0 ){
        names.push( str.substring(i0 + 3, i) );

        i0 = i;
      }
    }
  }

  if( lvl === 0 && names.length === 0 ){
    names.push( str );
  }

  return names;
};

const searchPostprocess = res => {
  let lines = res.split(/\n/);
  let ents = [];
  let type = 'protein';
  let namespace = 'uniprot';

  for( let i = 0; i < lines.length; i++ ){
    let line = lines[i];
    let isHeaderLine = i === 0;

    if( isHeaderLine || isEmpty( line ) ){ continue; }

    let data = line.split(/\t/);

    if( data.length < 5 ){
      throw new Error('Uniprot did not return enough data fields on line: ' + line);
    }

    let id = data[0];
    let organism = +data[1];
    let name = data[2];
    let geneNames = data[3].split(/\s+/);
    let proteinNames = parseProteinNames( data[4] );
    let url = BASE_URL + '/' + id;

    ents.push({ namespace, type, id, organism, name, geneNames, proteinNames, url });
  }

  return ents;
};

const getQuery = opts => searchQuery({ id: opts.id });

const getPostprocess = searchPostprocess;

const rawRequest = ( endpt, query ) => {
  let addr = BASE_URL + `/${endpt}` + ( query != null ? '?' + querystring.stringify( query ) : '' );

  return (
    Promise
      .try( () => fetch( addr ) )
      .then( res => res.text() )
  );
};

const request = memoize( rawRequest, LRUCache({ max: UNIPROT_CACHE_SIZE }) );

module.exports = {
  search( opts ){
    return (
      Promise.try( () => request( '', searchQuery(opts) ) )
        .then( searchPostprocess )
        .catch( () => [] )
      );
  },

  get( opts ){
    return Promise.try( () => request( '', getQuery(opts) ) ).then( getPostprocess ).then( res => res[0] );
  }
};
