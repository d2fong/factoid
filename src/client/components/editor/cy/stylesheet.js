const defs = require('./defs');

function makeStylesheet( doc ){
  let { activeColor, defaultColor, labelColor, nodeSize, interactionNodeSize } = defs;

  return [
    {
      selector: 'node',
      style: {
        'background-color': defaultColor,
        'width': nodeSize,
        'height': nodeSize,
        'label': function( node ){
          let name = node.data('name');
          let mod = node.data('modification');
          let completed = node.data('completed');

          if( !completed ){
            return '';
          } else
          if( mod == null || mod === 'unmodified' ){
            return name;
          } else {
            return mod.charAt(0).toLowerCase() + '-' + name;
          }
        },
        'text-outline-width': 2,
        'text-outline-color': defaultColor,
        'color': labelColor,
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: 'node[?isInteraction]',
      style: {
        'shape': 'ellipse',
        'width': 3,
        'height': 3,
        'label': '',
        'border-width': 3 * (interactionNodeSize - 2),
        'border-opacity': 0.0001
      }
    },
    {
      selector: 'node[?isInteraction][arity][arity < 2]',
      style: {
        'shape': 'roundrectangle',
        'width': interactionNodeSize,
        'height': interactionNodeSize
      }
    },
    {
      selector: 'node[?isInteraction].drop-target',
      style: {
        'border-width': 4 * (interactionNodeSize - 2)
      }
    },
    {
      selector: 'node[?isInteraction].tooltip-target',
      style: {
        'border-width': 0
      }
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': activeColor,
        'text-outline-color': activeColor
      }
    },
    {
      selector: 'node[?isInteraction]:selected',
      style: {
        'background-color': defaultColor,
        'text-outline-color': defaultColor
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
        'curve-style': 'bezier',
        'line-color': defaultColor,
        'target-arrow-color': defaultColor,
        'source-arrow-color': defaultColor,
        'source-endpoint': 'inside-to-node',
        'target-endpoint': 'outside-to-node'
      }
    },
    {
      selector: 'edge[type="positive"]',
      style: {
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: 'edge[type="negative"]',
      style: {
        'target-arrow-shape': 'tee'
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': activeColor,
        'target-arrow-color': activeColor
      }
    },
    {
      selector: '.edgehandles-preview, .edgehandles-ghost-edge',
      style: {
        'background-color': activeColor,
        'line-color': activeColor,
        'target-arrow-color': activeColor,
        'source-arrow-color': activeColor,
        'source-endpoint': 'inside-to-node',
        'target-endpoint': 'inside-to-node'
      }
    },
    {
      selector: '.edgehandles-ghost-edge',
      style: {
        'opacity': 0.5
      }
    },
    {
      selector: '.cxtmenu-tgt',
      style: {
        'overlay-opacity': 0
      }
    }
  ].filter( block => block != null );
}

module.exports = makeStylesheet;
