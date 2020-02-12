# Third party support for Mobility as a Service applications

Thanks to Mobility as a Service (MaaS) applications, citizens are stimulated to integrate public transport and partial mobility in their travel behaviour, because they get a better picture of which routes (and what their costs are) are possible to make their journey. Also cities can tackle challenges such as air quality and traffic jams by supporting multi modal transportation through MaaS applications. 
With third party support from the government, citizens receive a discount (or even free) on its journey if certain criteria are met. For example: was the journey made during rush hour or was a shared bicycle used?

![Overview](modi-overzicht.PNG)

## Step 3: subsidy measure and rule engine

In this step, we describe how a subsidy measure for third party support of MaaS apps can be described, in accordance with the standards of Linked Decisions as Linked Open Data (LBLOD). We also describe how the code of the rule engine looks like.
Finally, we demonstrate with a Proof of Concept how rules can be created by a city and then generate a rule engine from it automatically.

## Step 4: Detect voucher

The MaaS app knows from step 2 that certain vouchers are linked to a subsidy measure.
In other words, a MaaS app must keep track (e.g. add an extra column in a table) of which subsidy measure applies per voucher code.

## Step 5: Validation of user journey

### describe a journey with the OSLO mobility standard

In this section we describe how a trip can be described using the OSLO mobility standard for "trips and offerings". It is crucial that all MaaS apps use the same semantics for a user journey, so the rule engine can be generic.

This OSLO standard is an Application Profile (AP) and describes with a UML diagram which entities, relationships and attributes can or should be exchanged. The most important thing is that behind the scenes global identifiers (URIs) are used to describe these matters. Using HTTP URIs, which is one of the building blocks of Linked Data, ensures that everyone refers to something in the same way. An advantage from HTTP is that you can look up the term (e.g. https://schema.org/Trip to indicate that something is a Journey) to make sure the same thing is meant and this is not sensitive to any particular writing style. Thanks to this AP standard, developers can look up what the agreement is, namely which URIs (from OSLO vocabularies or other international standards) should be used. Different formats (JSON-LD, Turtle...) are possible to describe Linked Data, but the focus here is on the use of JSON-LD. See also the JSON-LD spec: https://www.w3.org/TR/json-ld11/#basic-concepts. 

The AP is published here: https://otl-test.data.vlaanderen.be/doc/applicatieprofiel/mobiliteit-trips-en-aanbod/kandidaatstandaard/20200112
For this use case, only the passenger part of the AP needs to be implemented. This can be seen below:
We will only implement Trip (Reis), the executed Route (uitgevoerdeRoute) and associated route segments.

<a href="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG"><img src="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG" align="left" height="500" width="auto" ></a>

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
