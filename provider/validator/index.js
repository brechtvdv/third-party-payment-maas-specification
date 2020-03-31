const JsonldParser = require("jsonld-streaming-parser").JsonLdParser;
const RdfDataModel = require("@rdfjs/data-model");
const { namedNode, literal, defaultGraph, quad } = RdfDataModel;
const program = require('commander'),
    fs = require('fs');

///////// Program
console.error("Validator for third party support of MaaS journeys. Use --help to discover more functions");

program
  .option('-s, --subsidy <subsidy>', 'path to a file that describes the subsidy measure of the third party')
  .option('-j, --journey <journey>', 'path to a file that describes the journey of the user')
  .parse(process.argv);

if (!program.subsidy || !program.journey) {
  console.error('Please provide a path to the subsidy measure and user journey');
  process.exit();
}

var journey = null;
if (program.journey && program.subsidy) {
  subsidy = JSON.parse(fs.readFileSync(program.subsidy, 'utf-8'));
  journey = JSON.parse(fs.readFileSync(program.journey, 'utf-8'));
}

////////////// Rule engine
var NS_OSLO_TRIPS_EN_AANBOD = 'https://data.vlaanderen.be/ns/mobiliteit/trips-en-aanbod#';
var NS_OSLO_SUBSIDIES = 'https://data.vlaanderen.be/ns/besluit-subsidies#';
var NS_MODI = 'https://lodi.ilabt.imec.be/modi#';

async function validateJourneyWithSubsidy(subsidy, journey) { 
  // Convert to RDF-JS store
  let subsidyStore = await jsonld2store(subsidy);
  let journeyStore = await jsonld2store(journey);
  
  // All criterion requirements for MaaS subsidies must be validated in order that a user has the right to obtain a subsidy 
  // For the PoC we consider there is only one criterion and one requirementGroup
  const criterionRequirementForMaaSSubsidies = subsidyStore.getQuads(null, null, namedNode(NS_MODI + 'CriterionRequirementForMaaSSubsidy'));

  let criterionRating = {}; // here we maintain the rating (OK, NOK) of every requirement and which route segment(s) is coupled with it

  for(let i in criterionRequirementForMaaSSubsidies) {
    const requirement = criterionRequirementForMaaSSubsidies[i].subject;
    const modality = subsidyStore.getQuads(requirement, namedNode(NS_MODI + 'modality'), null)[0];

    // 1. Validate modality has been undertaken in journey
    const segmentsWithModality = routesegmentsWithModality(journeyStore, modality.object.value);
    // 
    if (segmentsWithModality.length) {
      // 2. Validate location TODO
      // 3. Validate time TODO
      criterionRating[requirement] = {};
      criterionRating[requirement].rating = 'OK';
      criterionRating[requirement].relatedRoutesegments = segmentsWithModality;
    }
    else {
      console.log("NOK"); // no segments found, so user cannot validate all criteria
      return;
    }
  }

  // TODO validation of route segment chains (e.g. first train, then cargobike...)

  // Everything passed!
  console.log("OK");
}

function jsonld2store(jsonld) {
  const jsonldParser = new JsonldParser();
  const store = require("rdf-store-stream").storeStream(jsonldParser);  

  jsonldParser.write(JSON.stringify(jsonld));
  jsonldParser.end();

  return store;
}

function routesegmentsWithModality(store, modality) {
  let routesegmentsWithModality = [];
  const routesegments = store.getQuads(null, null, namedNode(NS_OSLO_TRIPS_EN_AANBOD + 'Routesegment'));
  for(let i in routesegments) {
    let modalityOfRoutesegment = store.getQuads(routesegments[i].subject, namedNode(NS_OSLO_TRIPS_EN_AANBOD + 'Routesegment.vervoermiddel'), null)[0];

    if (modalityOfRoutesegment.object.value === modality) routesegmentsWithModality.push(routesegments[i]);
  }
  return routesegmentsWithModality;
}

validateJourneyWithSubsidy(subsidy, journey);