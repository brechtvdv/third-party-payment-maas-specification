## Third party support for MaaS Specification: provider

In this section, we describe how a MaaS or mobility provider can describe a trip of a user following the OSLO mobility standard [trips and offerings](https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112). This mapping can be used as input for the [validating](#validator) to see whether this trip complies to a [subsidy measurement](#https://github.com/brechtvdv/third-party-support-maas-specification/tree/master/agency#subsidy-measurement-for-mobility-trips) and how much can be compensated.

## Mapping to OSLO mobility trips and offering

## Trip
A trip or journey. An itinerary of visits to one or more places.

```
{
 "@context": [
  "https://brechtvdv.github.io/third-party-support-maas-specification/provider/oslomobilitytripsandoffer.jsonld",
  "https://schema.org"
 ],
   "@type": "Trip",
   "executedRoute": {
       "@type": "Route",
       "usedRouteSegments": [ ... ]
    }
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `usedRouteSegments` | [Route segment](#Route-segment)  | Route segments that have been undertaken by the user.   |  |

## Route segment
Part of a Route taken without a Transfer using the same means of transport.

```
{
   "@type": "RouteSegment",
   "departureTime": "...",
   "arrivalTime": "...",
   "telemetry": [ ... ]
   "price": { ... },
   "meansOfTransport": "..."
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `departureTime` | xsd:dateTime  | When the user departed.  |  2018-01-01T01:01:00 |
| `arrivalTime` | xsd:dateTime  | When the user arrived.  |  2018-01-01T03:10:00 |
| `telemetry` | [Directed link](#DirectedLink) | Set of links that represent the GPS trajectory of the route segment. |  |
| `price` | [Monetary amount](#Monetary-amount) | Monetary amount that the user has paid or must pay without discount. | |
| `meansOfTransport` | Enum  | [Means of transport Type](#Means-of-transport-Type): the used modality or more specifically | http://www.wikidata.org/entity/Q11442 |

## Directed link
Link in either its positive or negative direction.

```
{
  "@type": "DirectedLink",
  "link": {
      "@type": "Link",
      "geometryCenterline": {
         "@type": "LineString",
         "wkt": "..."
      }
  },
  "direction": "..."
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `wkt` | WKT literal  |  Line string of the center line of the link. | LINESTRING(3.7099885940551762 51.03561909085579,4.692535400390624 50.88419254160871,4.357527494430542 50.84662457938373) |
| `direction` | Boolean  |  Indicates if the directed link agrees (True) or disagrees (False) with the positive direction (geometry of the center line from left to right) of the link | True |

## Monetary amount

```
{
   "@type": "MonetaryAmount",
   "value": "8.2",
   "currency": "EUR"
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `value` | Double  | The value of the quantitative value or property value node.  |  8.2 |
| `currency` | String | The currency in which the monetary amount is expressed. |  EUR |

### Enum definitions

#### Means of transport Type

| `type`      | `URI` | 
| ----------------- | ------- |
| `by foot`           | http://www.wikidata.org/entity/Q6537379
| `train` | http://www.wikidata.org/entity/Q870
| `cargobike`        |  http://www.wikidata.org/entity/Q573863
| `bike`      |  http://www.wikidata.org/entity/Q11442
| `electric bike`      |  http://www.wikidata.org/entity/Q924724
| `scooter`      |  http://www.wikidata.org/entity/Q193234

### Validate journey with rule engine

The user has finished his journey and the MaaS app can now describe its journey with the above OSLO standard.
To validate whether the journey is compliant with the criteria of the subsidy measure that is coupled with the voucher code,
the MaaS back-end can run a small software component (rule engine) that takes two files as input:
* a JSON-LD description of the criteria that is coupled with the subsidy measure: these criteria should be created by the local government and published with an Web API (like their website). For this Proof of Concept, the MaaS party will have a local copy of the description. We will create a simple GUI that can be used to create some example subsidy measures.
* a JSON-LD description of the user journey (see above)

The rule engine program can be run on Windows, Linux or MacOS and and looks like this on the command line:
```
./rule-engine -s exampleSubsidymeasure.jsonld -j exampleJourney.jsonld
```
This will return OK or NOK, which means that the voucher may be given or not respectively.
