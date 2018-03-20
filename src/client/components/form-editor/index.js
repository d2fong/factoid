const { Component } = require('react');
const h = require('react-hyperscript');
const io = require('socket.io-client');
const _ = require('lodash');


const logger = require('../../logger');
const debug = require('../../debug');

const Document = require('../../../model/document');

const DocumentWizardStepper = require('../document-wizard-stepper');


class EntityForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      entityName: ''
    };
  }
  render(){
    return h('input[type="text"].form-entity', {
      value: this.state.entityName,
      onChange: e => this.setState({
        entityName: e.target.value
      })
    });
  }
}

class InteractionForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      interactionType: 'interacts with'
    };
  }

  render(){
    return h('div.form-interaction', [
      h(EntityForm),
      h('span', [
        h('select', { value: this.state.intearctionType }, [
          h('option', { value: 'interacts with' }, 'interacts with'),
          h('option', { value: 'phosphorylates' }, 'phosphorylates'),
          h('option', { value: 'enzyme reaction' }, 'enzyme reaction'),
          h('option', { value: 'other' }, 'other')
        ])
      ]),
      h(EntityForm)
    ]);
  }
}


// TODO actually build a working UI that's hooked into the model
class FormEditor extends Component {
  constructor(props){
    super(props);

    let docSocket = io.connect('/document');
    let eleSocket = io.connect('/element');

    let logSocketErr = (err) => logger.error('An error occurred during clientside socket communication', err);

    docSocket.on('error', logSocketErr);
    eleSocket.on('error', logSocketErr);

    let id = _.get( props, 'id' );
    let secret = _.get( props, 'secret' );

    let doc = new Document({
      socket: docSocket,
      factoryOptions: { socket: eleSocket },
      data: { id, secret }
    });

    this.data = this.state = {
      document: doc
    };

    Promise.try( () => doc.load() )
      .then( () => logger.info('The doc already exists and is now loaded') )
      .catch( err => {
        logger.info('The doc does not exist or an error occurred');
        logger.warn( err );

        return ( doc.create()
          .then( () => logger.info('The doc was created') )
          .catch( err => logger.error('The doc could not be created', err) )
        );
      } )
      .then( () => doc.synch(true) )
      .then( () => logger.info('Document synch active') )
      .then( () => {

        if( debug.enabled() ){
          window.doc = doc;
          window.editor = this;
        }

        // force an update here

        this.forceUpdate();
        logger.info('The editor is initialising');
      } );

  }

  setData( obj, callback ){
    _.assign( this.data, obj );

    this.setState( obj, callback );
  }

  addElement( data = {} ){

    let doc = this.data.document;

    let el = doc.factory().make({
      data: _.assign( {
        type: 'entity',
        name: '',
      }, data )
    });

    return ( Promise.try( () => el.synch() )
      .then( () => el.create() )
      .then( () => doc.add(el) )
      .then( () => el )
    );
  }

  addInteraction( data = {} ){

    return this.addElement( _.assign({
      type: 'interaction',
      name: ''
    }, data) );
  }

  addInteractionRow(){

    this.addInteraction();

    this.addElement();

    this.addElement();
  }

  render(){
    const doc = this.state.document;
    const interactions = doc.interactions();
    const interactionForms = [];

    for (let i = 0; i < interactions.length; i++) {
      interactionForms.push(h(InteractionForm));
    }

    return h('div.document-form.page-content', [
      h('h1', 'Insert Pathway Information As Text'),
      ...interactionForms,
      h('button.form-interaction-adder', { onClick: e => this.addInteractionRow() }, [
        h('i.material-icons', 'add'),
        'add interaction'
      ]),
      h(DocumentWizardStepper, {
        backEnabled: false,
        // TODO
      })
    ]);
  }
}

module.exports = FormEditor;
