# Derdebetalersregeling voor Mobility as a Service

Dankzij Mobility as a Service (MaaS) applicaties worden burgers gestimuleerd om openbaar vervoer en deelmobiliteit te integreren in hun verplaatsingsgedrag. Met MaaS krijgen reizigers beter in kaart welke routes (en wat hun kost is) mogelijk zijn om hun verplaatsing te maken. Door hierop in te zetten kunnen steden en gemeenten uitdagingen zoals luchtkwaliteit en file-verkeer beter aanpakken. Eén manier is om te werken met een derdebetalersregeling. Dit houdt in dat een burger een korting krijgt van een lokaal bestuur indien de afgelegde reis voldoet aan bepaalde voorwaarden, bijvoorbeeld: was de verplaatsing afgelegd tijdens de spits of is een deelfiets gebruikt?

![Overview](modi-overzicht.PNG)

## Stap 3: de subsidiemaatregel en rule engine

In deze stap beschrijven we hoe een subsidiemaatregel voor de derdebetalersregeling voor MaaS beschreven kan worden, conform de standaarden van Gelinkte Besluiten als Linked Open Data (LBLOD). Ook beschrijven we hoe de code van de rule-engine eruit ziet.
Ten slotte demonstreren we met een Proof of Concept hoe regels opgebouwd kunnen worden en vervolgens zo'n rule-engine automatisch gegenereerd kan worden.

## Stap 4: Vouchercode detecteren

De MaaS-app weet van bij stap 2 dat een set vouchers gekoppeld zijn met een subsidiemaatregel.
Een Maas-app moet met andere woorden bijhouden (bv. een extra kolom toevoegen in de databank) welke subsidiemaatregel van toepassing is per vouchercode.

## Stap 5: Validatie

### een reis beschrijven met OSLO-Mobiliteit

In deze sectie beschrijven we hoe een reis beschreven kan worden met de OSLO-mobiliteitsstandaard voor "trips en aanbod". Het is namelijk cruciaal voor de rule engine dat de input van MaaS-apps op dezelfde manier beschreven is, ongeacht hoe deze in de back-end exact bijgehouden wordt.

Deze standaard is een Applicatie-Profiel (AP) en beschrijft adhv een UML-diagram welke entiteiten met bijhorende relaties en attributen uitgewisseld kunnen of moeten worden. Het belangrijkste om op te merken is dat er achter de schermen gewerkt wordt met globale identificatoren (URI's) om deze zaken te beschrijven. Het gebruiken van HTTP URI's, wat één van de bouwblokken van Linked Data is, zorgt ervoor dat iedereen op dezelfde manier naar iets verwijst. Dit heeft als voordeel dat je de term kan opzoeken (bv. https://schema.org/Trip om aan te duiden dat iets een Reis is) om zeker te zijn dat hetzelfde bedoeld wordt en dit is niet gevoelig voor bepaalde schrijfwijzes. Eenmaal de URI vast staat, wordt deze niet zomaar meer gewijzigd. Dankzij deze AP-standaard kunnen developers opzoeken wat de afspraak is, namelijk welke URI's (afkomstig van OSLO vocabularia of andere internationale standaarden) gebruikt moeten worden. Om Linked Data te beschrijven zijn verschillende formaten mogelijk, maar de focus hier ligt op het gebruik van JSON-LD. Indien dit nog onbekend klinkt, verwijzen we graag door naar de JSON-LD spec: https://www.w3.org/TR/json-ld11/#basic-concepts 

Voor derdebetalersregeling in MaaS-apps dient enkel het reizigersdeel van het AP geïmplementeerd te worden. Deze kan je hieronder zien:

<a href="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG"><img src="https://github.com/brechtvdv/third_party_payment_maas/blob/master/oslo-reis.PNG" align="left" height="500" width="auto" ></a>

We zullen dus enkel Reis, de uitgevoerde Route en bijhorende Routesegmenten gebruiken.
Bijvoorbeeld:
```
let reis = 
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

### valideren met rule engine

Een Maas-partij kan valideren en te weten komen hoeveel korting toegekend kan worden door de javascript-functie uit te voeren die verbonden is aan de voucher.
Bijvoorbeeld: let toeTeKennenKorting = berekenKortingVanSubsidiemaatregel1(reis)

```
const jsonldParser = new JsonLdParser();

var NS_OSLO_TRIPS_EN_AANBOD = 'https://data.vlaanderen.be/ns/mobiliteit/trips-en-aanbod#';

function berekenKortingVanSubsidiemaatregel1(reis) {
  let maxKorting = 5; // euro
  let toetekennenBedrag = 0; // hierin komt hoeveel toegekend mag worden
  
  // Omzetten naar RDF-JS object
  let store = jsonld2store(reis);
  
  // Valideren dat aan alles is voldaan
  const routesegmenten = store.getQuads(namedNode(NS_OSLO_TRIPS_EN_AANBOD + "RouteSegment"), null, null);(namedNode('http://example.org/subject'));
  // sorteren op vertrektijd etc. 
  console.log(routesegmenten);
  
	return [ [reisURI, "https://example.org#heeftRechtOpEuro", toetekennenBedrag] ]; 
}


function jsonld2store(reis) {
  const storeStream = require("rdf-store-stream").storeStream;
  // Import the json-ld stream into a store
  const store = await storeStream(jsonldParser);

  jsonldParser.write(reis);
    .on('data', console.log)
    .on('error', console.error)
    .on('end', () => console.log('All triples were parsed!'));
    
  return store;
}
```

