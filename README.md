# Third party support for Mobility as a Service Specification
_Dutch below_

The Third party support for MaaS Specification (TMS), started from the City of Things VLAIO call with the [MODI](https://www.vlaio.be/nl/andere-doelgroepen/city-things-slimme-steden-en-gemeenten/city-things#MoDi2B) project, is a specification for facilitating mobility discounts between local governments and citizens, through MaaS providers. Inspired by projects like the Mobility Data Specifications ([MDS](https://github.com/openmobilityfoundation/mobility-data-specification)) and Local Decisions as Linked Open Data ([LBLOD](https://github.com/lblod)), this specification provides a standardized way for local governements to express subsidy measurements for certain trips in a machine-readable format, and for MaaS providers to describe trips and validate these with the subsidy measurements in an automated fashion. Also, TMS provides templates for regulating mobility providers and for setting up a payment system between local government and MaaS providers.

TMS is currently comprised of four distinct components:

* [`license framework`](vergunningkader) (vergunningkader folder - only Dutch available) contains a local decision template that local governments can reuse for regulating shared mobility providers. In order that MaaS applications can apply for third party support from a local government, it is crucial that one or more mobility providers are operating in the cities' boundaries. Therefore, this template guide local governments to open the public domain for mobility providers. Only a Dutch version of this license framework is available.

* [`third party payment system agreement`](samenwerkingsovereenkomst) (samenwerkingsovereenkomst folder - only Dutch available) describes a 1 on 1 agreement between a local government and a MaaS provider. This incorporates the different steps that will taken from defining the subsidiy measurement and how the trip of a user will validated to reporting the usage of a subsidy measurement and reimbursement of the discounts.

* [`agency`](agency) specifies how local governments can create subsidy measurements in a machine-readable and standardized format. For example: _shared bikes have a maximum discount of 2 euro between 4pm and 6 pm_.

* [`provider`](provider) specifies how MaaS providers can describe the trip of a user in a machine-readable and standardized format. A validator API (_rule engine_) is made available that validates a trip with a subsidy measurement. This validator needs to be deployed on the infrastructure of the MaaS provider for privacy protection reasons. This way, MaaS providers don't need to implement rules themselves and more complex rules for the needs of local governments can be implemented without raising the complexity for MaaS providers. The source code is Open Source thus can be maintained and reused by all MaaS providers.


# Derdebetalersregeling voor Mobiliteit als een Dienst Specificatie

_Wordt later toegevoegd_
