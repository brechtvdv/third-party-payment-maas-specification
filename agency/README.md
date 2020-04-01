## Third party support for MaaS Specification: agency

This specification describes how an agency that regulates Mobility as a Service (MaaS) providers, can describe the rules that need to be fulfilled in order that the journey of a user gets compensated.

## Subsidy measurement for mobility journeys

We describe how a subsidy measure can be described for giving discounts to certain mobility journeys of a user. When the criteria of the subsidy measure is met, then the user retrieves a discount on the cost of the journey with a fixed amount (e.g. 2 euro) or procentual discount (e.g. 10%). This is demonstrated with a Proof of Concept (see below) that a local government can use to generate rules with an entry form.
The datamodel extends the Flemish Application Profile [Besluit - subsidies](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-subsidie/) of the Linked Decisions as Linked Open Data (LBLOD) project.

_This is still under construction_

## Subsidy measurement

For example:
```
{
	"@context": "https://brechtvdv.github.io/third-party-support-maas-specification/agency/subsidymeasurementformobility.jsonld",
	"@type": "SubsidyMeasurement",
	"name": "...",
	"hasCriterion": {
		"@type": "Criterion",
		"isFulfilledBy": {
			"@type": "RequirementGroup",
			"description": "...",
			"hasCriterionRequirement": [ ... ]
		}
	}
```

| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `name` | String  | Description of the subsidy measurement   | 1 euro discount for shared bikes |
| `description` | String   | Description of the criteria must be met by the users' journey. | The user must use a shared bike between 4pm and 5pm in the centre. |
| `hasCriterionRequirement` | [CriterionRequirement](#CriterionRequirement)   | Array of requirements |  |

## Criterium requirement

```
{
	"@type": "JourneyRequirement",
	"description": "...",
	"modality": "https://lodi.ilabt.imec.be/modi/thesauri/modality/1"
}
```
| Field        | Type | Description       | Example                                 |
| ------------ | ---- | ----------------- | ------------------------------------------- |
| `description` | String  | Description of a journey requirement   | A shared bike must have been used." |
| `modality` | Enum   | [Modality Type](#Modality Type) | shared bike |

### Enum definitions

#### Modality Type

| `type`      | `URI` | 
| ----------------- | ------- |
| `by foot`           | https://lodi.ilabt.imec.be/modi/thesauri/modality/0
| `train` | https://lodi.ilabt.imec.be/modi/thesauri/modality/1
| `cargobike`        |  https://lodi.ilabt.imec.be/modi/thesauri/modality/2  
| `bike`      |  https://lodi.ilabt.imec.be/modi/thesauri/modality/3
| `electric bike`      |  https://lodi.ilabt.imec.be/modi/thesauri/modality/4
| `electric scooter`      |  https://lodi.ilabt.imec.be/modi/thesauri/modality/5
| `electric step`      |  https://lodi.ilabt.imec.be/modi/thesauri/modality/6

### Entry form demonstrator
_Under construction_

See [Codepen](https://codepen.io/brechtvdv/pen/WNvQMdL)
