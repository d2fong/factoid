// given a INDRA statement type, determine what keys you should expect in the response

const modifications = new Set([
  "Acetylation", "AddModification", "Deacetylation", "Defarnesylation",
  "Degeranylgeranylation", "Deglycosylation", "Dehydroxylation", "Demethylation",
  "Demyristoylation", "Depalmitoylation", "Dephosphorylation", "Deribosylation",
  "Desumoylation", "Deubiquitination", "Farnesylation", "Geranylgeranylation",
  "Glycosylation", "Hydroxylation", "Methylation", "Modification", "Myristoylation",
  "Palmitoylation", "Phosphorylation", "RemoveModification", "Ribosylation",
  "Sumoylation","Ubiquitination"
]);

const selfModifications = new Set([
  'Autophosphorylation', 'SelfModification', 'Transphosphorylation'
]);

const regulateActivities = new Set([
  'Activation', 'Inhibition', 'RegulateActivity'
]);

const activeForms = new Set([
  'ActiveForm', 'HasActivity'
]);

const gefs = new Set([
  'Gef'
]);

const gaps = new Set([
  'Gap'
]);

const complexes = new Set([
  'Complex'
]);

const translocations = new Set([
  'Translocation'
]);

const regulateAmounts = new Set([
  'DecreaseAmount', 'IncreaseAmount', 'Influence', 'RegulateAmount'
]);

const conversions = new Set([
  'Conversions'
]);

const allStatementTypes = [ modifications, selfModifications, regulateActivities,
  activeForms, gefs, complexes, regulateAmounts, conversions
];

const ENZYME = 'enz';
const SUBSTRATE = 'sub';
const SUBJECT = 'subj';
const OBJECT = 'obj';
const AGENT = 'agent';
const ACTIVITY = 'activity';
const GUANOSINE_EXCHANGE_FACTOR = 'gef';
const GTPASE_PROTEIN = 'ras';
const GTPASE_ACTIVATING_PROTEIN = 'gap';
const COMPLEX_MEMBERS = 'members';
const OBJECT_TO = 'obj_to';
const OBJ_FROM = 'obj_from';


// TODO: add unique keys (e.g regulateActivities has a 'activity' key)
module.exports = INDRAStatementType => {
  if (modifications.has(INDRAStatementType)) {
    return {
      agents: [ENZYME, SUBSTRATE]
    };
  }

  if (selfModifications.has(INDRAStatementType)) {
    return {
      agents: [ENZYME]
    };
  }

  if (regulateActivities.has(INDRAStatementType)) {
    return {
      agents: [SUBJECT, OBJECT]
    };
  }

  if (activeForms.has(INDRAStatementType)) {
    return {
      agents: [AGENT]
    };
  }

  if (gefs.has(INDRAStatementType)) {
    return {
      agents: [GUANOSINE_EXCHANGE_FACTOR, GTPASE_PROTEIN]
    };
  }

  if (gaps.has(INDRAStatementType)) {
    return {
      agents: [GTPASE_ACTIVATING_PROTEIN, GTPASE_PROTEIN]
    };
  }

  if (complexes.has(INDRAStatementType)) {
    return {
      agents: [COMPLEX_MEMBERS]
    };
  }

  if (translocations.has(INDRAStatementType)) {
    return {
      agents: [AGENT]
    };
  }

  if (regulateAmounts.has(INDRAStatementType)) {
    return {
      agents: [SUBJECT, OBJECT]
    };
  }

  if (conversions.has(INDRAStatementType)) {
    return {
      agents: [SUBJECT, OBJ_FROM, OBJECT_TO]
    };
  }

  return {
    agents: []
  };
};