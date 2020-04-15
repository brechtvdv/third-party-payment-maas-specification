const JsonldParser = require("jsonld-streaming-parser").JsonLdParser;
const RdfDataModel = require("@rdfjs/data-model");
const { namedNode, literal, defaultGraph, quad } = RdfDataModel;
const program = require('commander'),
    fs = require('fs');

///////// Program
console.error("Validator for third party support of MaaS trips. Use --help to discover more functions");

program
  .option('-s, --subsidy <subsidy>', 'path to a file that describes the subsidy measure of the third party')
  .option('-t, --trip <trip>', 'path to a file that describes the trip of the user')
  .parse(process.argv);

if (!program.subsidy || !program.trip) {
  console.error('Please provide a path to the subsidy measure and user trip');
  process.exit();
}

var trip = null;
if (program.trip && program.subsidy) {
  subsidy = JSON.parse(fs.readFileSync(program.subsidy, 'utf-8'));
  trip = JSON.parse(fs.readFileSync(program.trip, 'utf-8'));
}

////////////// Rule engine
var NS_OSLO_TRIPS_AND_OFFER = 'https://data.vlaanderen.be/ns/mobiliteit/trips-en-aanbod#';
var NS_LBLOD_SUBSIDIES = 'http://data.vlaanderen.be/ns/subsidie#';
var NS_MODI = 'https://lodi.ilabt.imec.be/modi#';
var NS_SCHEMA_ORG = 'http://schema.org/';

async function validateTripWithSubsidy(subsidy, trip) { 
  // Convert to RDF-JS store
  let subsidyStore = await jsonld2store(subsidy);
  let tripStore = await jsonld2store(trip);

  const payment = subsidyStore.getQuads(null, namedNode(NS_LBLOD_SUBSIDIES + 'biedtAan'), null)[0].object;
  const paymentAmount = subsidyStore.getQuads(payment, namedNode(NS_LBLOD_SUBSIDIES + 'bedrag'), null)[0];
  const paymentPercentage = subsidyStore.getQuads(payment, namedNode(NS_MODI + 'percentage'), null)[0];
  const paymentMaximumAmount = subsidyStore.getQuads(payment, namedNode(NS_LBLOD_SUBSIDIES + 'maximumbedrag'), null)[0];

  // All route segment requirements for MaaS subsidies must be validated in order that a user has the right to obtain a subsidy 
  // For the PoC we consider there is only one criterion and one requirementGroup
  const routeSegmentRequirements = subsidyStore.getQuads(null, null, namedNode(NS_MODI + 'RouteSegmentRequirement'));

  let requirementRatings = []; // here we maintain the rating (OK, NOK) of every requirement and which route segment(s) is coupled with it

  for(let i in routeSegmentRequirements) {
    const requirement = routeSegmentRequirements[i].subject;
    const meansOfTransport = subsidyStore.getQuads(requirement, namedNode(NS_MODI + 'RouteSegmentRequirement.meansOfTransport'), null)[0];
    const location = subsidyStore.getQuads(requirement, namedNode(NS_MODI + 'RouteSegmentRequirement.location'), null)[0];
    const time = subsidyStore.getQuads(requirement, namedNode(NS_SCHEMA_ORG + 'hoursAvailable'), null)[0];

    // 1. Validate that meansOfTransport has been undertaken in trip
    const segmentsWithMeansOfTransport = routesegmentsWithmeansOfTransport(tripStore, meansOfTransport.object.value);
    if (segmentsWithMeansOfTransport.length) {
      // We will only check the first one (for now)
      const segmentWithMeansOfTransport = segmentsWithMeansOfTransport[0];
      const price = tripStore.getQuads(segmentWithMeansOfTransport.subject, namedNode(NS_SCHEMA_ORG + 'price'), null)[0].object;
      const priceValue = parseFloat(tripStore.getQuads(price, namedNode(NS_SCHEMA_ORG + 'value'), null)[0].object.value);

      // 2. Validate location TODO
      // 3. Validate time TODO

      requirementRatings[requirement] = {};
      requirementRatings[requirement].rating = 'OK';
      requirementRatings[requirement].priceValue = priceValue;
      requirementRatings[requirement].relatedRoutesegments = segmentWithMeansOfTransport;
    }
    else {
      let compensation = {  "@context": [ "https://brechtvdv.github.io/third-party-support-maas-specification/agency/subsidymeasurementformobility.jsonld",
                          {
                            "tripIsConform": "https://lodi.ilabt.imec.be/modi#tripIsConform"
                          }
                        ],
                       "@type": "Payment",
                       "amount": 0.0,
                       "tripIsConform": false
                    };
      // stop here
      console.log(JSON.stringify(compensation));
      return;
    }
  }

  // All requirements passed
  // Take sum of prices
  let totalPrice = 0.0;
  for (let i in requirementRatings) {
    totalPrice += requirementRatings[i].priceValue
  }

  let compensation = {  "@context": [ "https://brechtvdv.github.io/third-party-support-maas-specification/agency/subsidymeasurementformobility.jsonld",
                          {
                            "tripIsConform": "https://lodi.ilabt.imec.be/modi#tripIsConform"
                          }
                        ],
                       "@type": "Payment",
                       "amount": 0.0,
                       "tripIsConform": true
                    };

  if (paymentAmount) {
      const paymentAmountValue = parseFloat(paymentAmount.object.value)
      if (totalPrice > paymentAmountValue) {
        compensation.amount = paymentAmountValue;
      } else {
        // don't compensate more than the trips' cost
        compensation.amount = totalPrice;
      }
  } else if (paymentPercentage) {
      const paymentPercentageValue = parseFloat(paymentPercentage.object.value);
      const paymentAmountWithPercentage = paymentPercentageValue * totalPrice;
      const paymentMaximumAmountValue = parseFloat(paymentMaximumAmount.object.value)
      if (paymentAmountWithPercentage > paymentMaximumAmountValue) {
        compensation.amount = paymentMaximumAmountValue;
      } else {
        compensation.amount = paymentAmountWithPercentage;
      }
  }

  console.log(JSON.stringify(compensation));
}

function jsonld2store(jsonld) {
  const jsonldParser = new JsonldParser();
  const store = require("rdf-store-stream").storeStream(jsonldParser);  

  jsonldParser.write(JSON.stringify(jsonld));
  jsonldParser.end();

  return store;
}

function routesegmentsWithmeansOfTransport(store, meansOfTransport) {
  // Search for route segments that used this means of transport
  let routesegmentsWithmeansOfTransport = [];
  const routesegments = store.getQuads(null, null, namedNode(NS_OSLO_TRIPS_AND_OFFER + 'Routesegment'));
  for(let i in routesegments) {
    let meansOfTransportOfRoutesegment = store.getQuads(routesegments[i].subject, namedNode(NS_OSLO_TRIPS_AND_OFFER + 'Routesegment.vervoermiddel'), null)[0];

    if (meansOfTransportOfRoutesegment.object.value === meansOfTransport) routesegmentsWithmeansOfTransport.push(routesegments[i]);
  }
  return routesegmentsWithmeansOfTransport;
}

validateTripWithSubsidy(subsidy, trip);