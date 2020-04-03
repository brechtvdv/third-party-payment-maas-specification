## Third party support for MaaS Specification: agency

This specification describes how an agency that regulates Mobility as a Service (MaaS) providers, can describe the rules that need to be fulfilled in order that the trip of a user gets compensated.

## Subsidy measurement for mobility trips

We describe how a subsidy measure can be described for giving discounts to certain mobility trips of a user. When the criteria of the subsidy measure is met, then the user retrieves a discount on the cost of the trip with a fixed amount (e.g. 2 euro) or procentual discount (e.g. 10%). This is demonstrated with an entry form as Proof of Concept (see [below](#Entry-form-demonstrator)) that a local government can use to generate the rules with.
The datamodel extends the Flemish Application Profile [Besluit - subsidies](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-subsidie/) of the Linked Decisions as Linked Open Data (LBLOD) project.

_This is still under construction_

## Subsidy measurement

```
{
	"@context": "https://brechtvdv.github.io/third-party-support-maas-specification/agency/subsidymeasurementformobility.jsonld",
	"@type": "SubsidyMeasurement",
	"name": "...",
	"offers": {
		...
	},
	"hasCriterion": [{
		"@type": "Criterion",
		"isFulfilledBy": [{
			"@type": "RequirementGroup",
			"description": "...",
			"hasCriterionRequirement": [ ... ]
		}]
	}]
}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `name` | String  | Description of the subsidy measurement   | 1 euro discount for shared bikes |
| `description` | String   | Description of the criteria must be met by the users' trip. | The user must use a shared bike between 4pm and 5pm in the centre. |
| `offers` | [Payment](#Payment)   | Third party payment that the user is entitled to when all criteria are met. |  |
| `hasCriterionRequirement` | [CriterionRequirement](#CriterionRequirement)   | Array of requirements |  |

## Payment

```
{
	"@type": "Payment",
	"name": "...",
	"amount": "...",
	"percentage": "..."
}
```
| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `name` | String  | Description of the third party payment  | 1 euro discount |
| `amount` | Double   | Fixed number of Euro that will be compensated. | 1 |
| `percentage` | Double   | Percentage of the total cost of the trip that will be compensated. Note: do not use `amount` and `percentage` together | 7 |
| `maximumAmount` | Double | Maximum number of Euro that will be compensated. Use this in combination with the `percentage` field. | 5 |

## Criterium requirement

```
{
	"@type": "RouteSegmentRequirement",
	"description": "...",
	"meansOfTransport": "...",
	"location": { ... },
	"time": [ ... ]
}
```
| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `description` | String  | Description of a requirement that a route segment of the trip of a user must comply with.   | Only shared bikes, on monday between 4pm and 6pm and used in the centre of the city." |
| `meansOfTransport` | Enum   | [Means of transport Type](#Means-of-transport-Type): which mode of transport or more specific (e.g. electric bike) the user must use for the route segment. | http://www.wikidata.org/entity/Q11442 |
| `location` | [Location](#Location)  | Location that the route segment must be covered with.  |  |
| `time` |  [OpeningHoursSpecification](#OpeningHoursSpecification) | Description of the hours during which the route segment must have happened. | |

## Location

```
{
	"@type": "Place",
	"geometry": {
		"wkt": "..."
	}
}
```
| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `wkt` | WKT Literal  | Well Known Text (WKT) description of the area that the route segment must be covered with.  | POLYGON((4.676055908203124 50.88993205766312,4.723434448242187 50.89025691478409,4.72360610961914 50.86610302664647,4.675369262695312 50.86599468504889,4.676055908203124 50.88993205766312)) |

## OpeningHoursSpecification

```
{
	"@type": "OpeningHoursSpecification",
	"dayOfWeek": "...",
	"startTime": "..."
      	"endTime": "..."
}
```
| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `dayOfWeek` | Enum  | [Day of week](#Day-of-week)   | http://schema.org/Monday |
| `startTime` | Time  |    | 15:00:00 |
| `endTime` | Time   |  | 18:00:00 |

## Multi modal trips

A user is entitled for payment when all Criteria is met. For a multi modal trip, this means that there is one Criterion for every route segment, which uses the same transport resource. Strict order of criteria is currently not supported. 
```
"hasCriterion": [{
		"@type": "Criterion",
		"isFulfilledBy": [{
			...
		},
		"@type": "Criterion",
		"isFulfilledBy": [{
			...
		}],
		...
		}
	}]
```


### Enum definitions

#### Means of transport Type

| `type`      | `URI` | 
| ----------------- | ------- |
| `by foot`           | https://www.wikidata.org/entity/Q6537379
| `train` | https://www.wikidata.org/entity/Q870
| `cargobike`        |  https://www.wikidata.org/entity/Q573863
| `bike`      |  http://www.wikidata.org/entity/Q11442
| `electric bike`      |  http://www.wikidata.org/entity/Q924724
| `scooter`      |  http://www.wikidata.org/entity/Q193234

#### Day of week

| `type`      | `URI` | 
| ----------------- | ------- |
| `Monday`           | http://schema.org/Monday
| `Tuesday` | http://schema.org/Tuesday
| `Wednesday`        |  http://schema.org/Wednesday
| `Thursday`      |  http://schema.org/Thursday
| `Friday`      |  http://schema.org/Friday
| `Saturday`      |  http://schema.org/Saturday
| `Sunday`      |  http://schema.org/Sunday


## Entry form demonstrator
_Under construction_

See [Codepen](https://codepen.io/brechtvdv/pen/WNvQMdL)
