## Third party support for MaaS Specification: provider

In this section, we describe how a MaaS or mobility provider can describe a trip of a user following the OSLO mobility standard [trips and offerings](https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112). This mapping can used as input for the [validating](#validator) to see whether this trip complies to a [subsidy measurement](#https://github.com/brechtvdv/third-party-support-maas-specification/tree/master/agency#subsidy-measurement-for-mobility-trips) and how much can be compensated.

## Mapping to OSLO mobility trips and offering

This OSLO standard is an Application Profile (AP) and describes with a UML diagram which entities, relationships and attributes can or should be exchanged. The most important thing is that behind the scenes global identifiers (URIs) are used to describe these matters. Using HTTP URIs, which is one of the building blocks of Linked Data, ensures that everyone refers to something in the same way. An advantage from HTTP is that you can look up the term (e.g. https://schema.org/Trip to indicate that something is a Journey) to make sure the same thing is meant and this is not sensitive to any particular writing style. Thanks to this AP standard, developers can look up what the agreement is, namely which URIs (from OSLO vocabularies or other international standards) should be used. Different formats (JSON-LD, Turtle...) are possible to describe Linked Data, but the focus here is on the use of JSON-LD. See also the JSON-LD spec: https://www.w3.org/TR/json-ld11/#basic-concepts. 

For the use case of describing a trip, we will only implement Trip (Reis), the executed Route (uitgevoerdeRoute) and associated route segments.

## Trip
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
| `usedRouteSegments` | [Route segment](#Route-segment)  | Route segments that has been undertaken by the user.   |  |

## Route segment
```
{
   "@type": "RouteSegment",
   "departureTime": "...",
   "arrivalTime": "...",
   "departurePoint": { 
      "@type": "Point",
      "wkt": "POINT(3.7099885940551762 51.03561909085579)"
   },
   "arrivalPoint": { 
      "@type": "Point",
      "wkt": "POINT(4.357527494430542 50.84662457938373)"
   },
   "price": {
     "@type": "MonetaryAmount",
     "value": "8,2",
     "currency": "EUR"
   },
   "modality": "https://lodi.ilabt.imec.be/modi/thesauri/modality/1"
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `departureTime` | xsd:dateTime  | Date time that the user left the departure point with a certain modality.  |  2018-01-01T01:01:00 |




<a href="https://github.com/brechtvdv/third_party_payment_maas/blob/master/provider/oslo-reis.PNG"><img src="https://github.com/brechtvdv/third_party_payment_maas/blob/master/provider/oslo-reis.PNG" align="left" height="500" width="auto" ></a>

As example, we describe the minimal information that must be provided of a journey. Here we say that a traveller (Reiziger) undertakes a journey (Reis). The route that is performed (uitgevoerdeRoute) consists of (bestaatUit) route segments. A route segment describes a part of the journey that has been done with the same transportation modality (vervoermiddel). It contains its time of departure (vertrektijdstip) and arrival (aankomsttijdstip) and from point A (vertrekpunt) to point B (aankomstpunt) it is located. 
For the modality types, the URIs will be maintained here: https://github.com/brechtvdv/criterionrequirement_for_mobility/blob/master/skos-modality.ttl 

```
let journey = 
{ "@context": [ "https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112/context/mobiliteit-trips-en-aanbod-ap.jsonld",
"https://schema.org"
]
 "@type": "Reiziger",
 "Onderneemt": {
   "@type": "Reis",
   "uitgevoerdeRoute": {
     "@type": "Route",
     "BestaatUit": [
       {
         "@type": "Routesegment",
         "vertrektijdstip": "2018-01-01T01:01:00",
         "aankomsttijdstip": "2018-01-01T01:31:00",
         "vertrekpunt": { 
            "@type": "Punt",
            "wkt": "POINT(3.7099885940551762 51.03561909085579)"
         },
         "aankomstpunt": { 
            "@type": "Punt",
            "wkt": "POINT(4.357527494430542 50.84662457938373)"
         },
         "kostprijs": {
           "@type": "Geldbedrag",
           "value": "8,2",
           "currency": "EUR"
         },
         "Routesegment.vervoermiddel": "https://lodi.ilabt.imec.be/modi/thesauri/modality/1"
       },
       {
         "@type": "Routesegment",
         "vertrektijdstip": "2018-01-01T01:31:00",
         "aankomsttijdstip": "2018-01-01T01:40:00",
         "vertrekpunt": { 
            "@type": "Punt",
            "wkt": "POINT(4.357527494430542 50.84662457938373)"
         },
         "aankomstpunt": { 
            "@type": "Punt",
            "wkt": "POINT(4.365552663803101 50.84217373687747)"
         },
         "Routesegment.vervoermiddel": "https://lodi.ilabt.imec.be/modi/thesauri/modality/2"
       }
     ]
   }
 }
}
```

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
