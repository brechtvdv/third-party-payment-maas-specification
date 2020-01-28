# Third party support for Mobility as a Service applications

Thanks to Mobility as a Service (MaaS) applications, citizens are stimulated to integrate public transport and partial mobility in their travel behaviour, because they get a better picture of which routes (and what their costs are) are possible to make their journey. Also cities can tackle challenges such as air quality and traffic jams by supporting multi modal transportation through MaaS applications. 
With third party support from the government, citizens receive a discount (or even free) on its journey if certain criteria are met. For example: was the journey made during rush hour or was a shared bicycle used?

![Overview](modi-overzicht.PNG)

## Step 3: subsidy measure and rule engine

In this step, we describe how a subsidy measure for third party support of MaaS apps can be described, in accordance with the standards of Linked Decisions as Linked Open Data (LBLOD). We also describe how the code of the rule engine looks like.
Finally, we demonstrate with a Proof of Concept how rules can be created by a city and then generate a rule engine from it automatically.

## Step 4: Detect voucher

The MaaS app knows from step 2 that certain vouchers are linked to a subsidy measure.
In other words, a MaaS app must keep track (e.g. add an extra column in the database) of which subsidy measure applies per voucher code.

## Step 5: Validation of user journey

### describe a journey with the OSLO mobility standard

In this section we describe how a trip can be described using the OSLO mobility standard for "trips and offerings". It is crucial that all MaaS apps use the same semantics for a user journey, so the rule engine can be generic.

This OSLO standard is an Application Profile (AP) and describes with a UML diagram which entities, relationships and attributes can or should be exchanged. The most important thing is that behind the scenes global identifiers (URIs) are used to describe these matters. Using HTTP URIs, which is one of the building blocks of Linked Data, ensures that everyone refers to something in the same way. An advantage from HTTP is that you can look up the term (e.g. https://schema.org/Trip to indicate that something is a Journey) to make sure the same thing is meant and this is not sensitive to any particular writing style. Thanks to this AP standard, developers can look up what the agreement is, namely which URIs (from OSLO vocabularies or other international standards) should be used. Different formats (JSON-LD, Turtle...) are possible to describe Linked Data, but the focus here is on the use of JSON-LD. See also the JSON-LD spec: https://www.w3.org/TR/json-ld11/#basic-concepts. 

The AP is published here: https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112
For this use case, only the passenger part of the AP needs to be implemented. This can be seen below:
We will only implement Trip (Reis), the executed Route (uitgevoerdeRoute) and associated route segments.

<a href="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG"><img src="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG" align="left" height="500" width="auto" ></a>

Example journey:
```
let journey = 
{ "@context": [ "https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112/context/mobiliteit-trips-en-aanbod-ap.jsonld", "https://schema.org"
]
 ,  "@id": "https://w3id.github.io/people/brechtvdv",
  "@type": "Reiziger",
 "pseudoniem": "brechtvdv",
 "Onderneemt": {
   "@id": "reizen/123",
   "@type": "Reis",
   "vertrektijdstip": "2018-01-01T01:01:00",
   "aankomsttijdstip": "2018-01-01T01:40:00",
   "Reis.reisweg": [
     {"@value": "Station Gent-Sint-Pieters", "@language": "nl" }, {"@value": "Koninklijke Vlaamse Academie", "@language": "nl"}
   ],
   "uitgevoerdeRoute": {
     "@type": "Route",
     "BestaatUit": [
       {
         "@type": RouteSegment",
         "vertrektijdstip": "2018-01-01T01:01:00",
         "aankomsttijdstip": "2018-01-01T01:31:00",
         "vertrekpunt": "Station Gent-Sint-Pieters",
         "aankomstpunt": "Station Brussel-Centraal",
         "reisduur": "PT30M",
         "kostprijs": {
           "@type": "Geldbedrag",
           "value": "8,2",
           "currency": "EUR"
         },
         "Route.type": "https://data.vlaanderen.be/conceptscheme/routetypes/id/goedkoopst",
         "Vervoermiddel": "https://data.vlaanderen.be/conceptscheme/vervoermiddelen/id/trein"
       },
       {
         "@type": RouteSegment",
         "vertrektijdstip": "2018-01-01T01:31:00",
         "aankomsttijdstip": "2018-01-01T01:40:00",
         "vertrekpunt": "Station Brussel-Centraal",
         "aankomstpunt": "Koninklijke Vlaamse Academie",
         "reisduur": "PT9M",
         "Route.type": "https://data.vlaanderen.be/conceptscheme/id/snelst",
         "Vervoermiddel": "https://data.vlaanderen.be/conceptscheme/vervoermiddelen/id/teVoet"
       }
     ]
   }
 }
 
}
```

### Validate with rule engine

A MaaS app can validate and find out how much discount can be granted by executing the javascript function associated with the voucher.
For example: let discountToBeGranted = calculateDiscountFromSubsidy1(journey)
