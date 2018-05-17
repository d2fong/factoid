const React = require('react');
const ReactDom = require('react-dom');
const Cytoscape = require('cytoscape');
const h = require('react-hyperscript');
const hh = require('hyperscript');
const tippyjs = require('tippy.js');
const _ = require('lodash');
const Promise = require('bluebird');


const makeStylesheet = require('./cy/stylesheet');
const sampleNetwork = require('./sample-network');

const { makeClassList, isInteractionNode, defer } = require('../../../util');
const defs = require('../../defs');


class Help extends React.Component {
  constructor(props){
    super(props);

    this.data = ({
      showHelp: false,
      mountDeferred: defer()
    });

    this.state = _.assign({}, this.data);
    props.bus.on('togglehelp', () => this.toggleHelp());

    Promise.try( () => {} )
      .then( () => this.data.mountDeferred.promise )
      .then( () => {
        let helpGraphCtr = ReactDom.findDOMNode(this).querySelector('#help-editor');
        this.data.cy = Cytoscape({
          container: helpGraphCtr,
          stylesheet: makeStylesheet(),
          minZoom: defs.minZoom,
          maxZoom: defs.maxZoom,
          zoom: ( defs.minZoom + defs.maxZoom ) / 2,
          elements: sampleNetwork,
          layout: {
            name: 'preset',
            fit: false
          }
        });
      });
  }

  setData( obj, callback ){
    _.assign( this.data, obj );

    this.setState( obj, callback );
  }

  componentDidMount(){
    this.data.mountDeferred.resolve();
  }

  componentWillUnmount(){
    this.props.bus.removeListener(this.toggle);
    if( this.data.entTip ){
      this.data.entTip.destroy();
    }
    if( this.data.intnTip ){
      this.data.intnTip.destroy();
    }
  }

  toggleHelp(){
    let showHelp = this.data.showHelp;
    let bus = this.props.bus;
    let cy = this.props.cy;

    if( !showHelp ){
      bus.emit('showtips');

      let ent = cy.nodes(node => !isInteractionNode(node)).first();
      if( !ent.empty() ){
        let entRef = ent.popperRef();
        let entTippy = new tippyjs(entRef, _.assign({}, defs.tippyDefaults, {
          html: (() => {
            return hh('div.editor-help-tooltip', [
              hh('div', 'Provide entity name'),
              hh('ul', [
                hh('li', 'E.g P53')
              ])
            ]);
          })(),
          theme: 'dark',
          placement: 'right',
          trigger: 'manual',
          distance: 32,
          zIndex: defs.tippyTopZIndex
        })).tooltips[0];
        this.data.entTip = entTippy;
        entTippy.show();
      }

      let intn = cy.nodes(isInteractionNode).first();
      if( !intn.empty() ){
        let intnRef = intn.popperRef();
        let intnTippy = new tippyjs(intnRef, _.assign({}, defs.tippyDefaults, {
          html: (() => {
            return hh('div.editor-help-tooltip', [
              hh('div', 'Provide interaction type and direction'),
              hh('ul', [
                hh('li', 'E.g A activates phosphorylation of B')
              ])
            ]);
          })(),
          theme: 'dark',
          trigger: 'manual',
          placement: 'left',
          distance: 32,
          zIndex: defs.tippyTopZIndex
        })).tooltips[0];

        this.data.intnTip = intnTippy;
        intnTippy.show();
      }
      this.setData({ showHelp: true });
    } else {
      bus.emit('hidetips');
      if( this.data.entTip ){
        this.data.entTip.hide();
      }
      if( this.data.intnTip ){
        this.data.intnTip.hide();
      }
      this.setData({ showHelp: false });
    }
  }


  render(){
    let helpContent = [
      h('div#help-editor', { className: makeClassList({'help-editor-active': this.state.showHelp})}),
      h('div.editor-help-overlay', {
        onClick: () => this.toggleHelp(),
         className: makeClassList({'editor-help-overlay-active': this.state.showHelp})
        }
      )
    ];

    if( this.state.showHelp ){
      helpContent.push(
        h('div.editor-button.editor-help-close-button', { onClick: () => this.toggleHelp()}, [
          h('i.material-icons', 'close')
        ])
      );
    }

    return h('div.help', helpContent);
  }
}


module.exports = Help;