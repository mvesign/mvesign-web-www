---
title: 'SonarQube: "ISerializable" correct implementeren'
description: SonarQube meldt dat een eigen exception het serialisatiepatroon van Microsoft niet volgt. Wat de regel controleert en welke twee aanpassingen de melding oplossen.
date: 2022-12-13
tags: [dotnet, qa]
---
Onlangs kreeg ik de volgende code smell in mijn SonarQube-analyse.

- Update this implementation of 'ISerializable' to conform to the recommended serialization pattern.

Eerst besteedde ik er niet veel aandacht aan, maar mijn `0-smells-policy` sloeg aan en dwong me er beter naar te kijken. Het probleem zat in een eigen `Exception`: een gewone eigen `Exception` met maar één publieke constructor.

```csharp
/// <summary>
/// Must be thrown when an unsupported feature is trying to be performed.
/// </summary>
[ExcludeFromCodeCoverage]
public class UnsupportedFeatureException : Exception
{
    /// <inheritdoc />
    public UnsupportedFeatureException(string message) : base(message) { }
}
```

Waarom duikt deze code smell dan op? Daarvoor kijk ik naar de [betreffende regel van SonarQube](https://rules.sonarsource.com/csharp/tag/pitfall/RSPEC-3925). Daar staat het volgende:

> Deze regel meldt een issue bij types die ISerializable implementeren zonder het serialisatiepatroon te volgen dat Microsoft aanbeveelt.
>
> De regel controleert specifiek op deze problemen:
>
> - Het attribute System.SerializableAttribute ontbreekt.
> - Niet-serialiseerbare velden zijn niet gemarkeerd met het attribute System.NonSerializedAttribute.
> - Er is geen serialisatie-constructor.
> - Een niet-gesealed type heeft een serialisatie-constructor die niet protected is.
> - Een gesealed type heeft een serialisatie-constructor die niet private is.
> - Een niet-gesealed type heeft een ISerializable.GetObjectData die niet zowel public als virtual is.
> - Een afgeleid type heeft een serialisatie-constructor die de constructor van de basisklasse niet aanroept.
> - Een afgeleid type heeft een ISerializable.GetObjectData-methode die de methode van de basisklasse niet aanroept.
> - Een afgeleid type heeft serialiseerbare velden, maar de ISerializable.GetObjectData-methode is niet overridden.

Als ik terugkijk naar de code, zie ik een aantal punten waar ik me niet aan hield.

- Het attribute `System.SerializableAttribute` ontbreekt.
- Een niet-gesealed type heeft een serialisatie-constructor die niet protected is.

Met de volgende aanpassing is het probleem opgelost. Opvallend zijn het toegevoegde attribute `System.SerializableAttribute` en de protected constructor.

```csharp
/// <summary>
/// Must be thrown when an unsupported feature is trying to be performed.
/// </summary>
[Serializable, ExcludeFromCodeCoverage]
public class UnsupportedFeatureException : Exception
{
    /// <inheritdoc />
    public UnsupportedFeatureException(string message) : base(message) { }

    // Without this ctor, deserialization will fail.
    /// <inheritdoc />
    protected UnsupportedFeatureException(SerializationInfo info, StreamingContext context) : base(info, context) { }
}
```

Blijft nog de vraag waarom deze aanpassingen nodig zijn. Wij implementeren de `ISerializable`-interface toch niet? Toch wel: de `Exception`-klasse implementeert de `ISerializable`-interface. Dat staat ook in de regel van SonarQube zelf.

> Klassen die van Exception erven, implementeren ISerializable. Zorg dat het attribute [Serializable] wordt gebruikt en dat ISerializable correct wordt geïmplementeerd. Ook als je het object niet zelf expliciet wilt serialiseren, kan serialisatie toch nodig zijn, bijvoorbeeld bij het oversteken van de grens van een AppDomain.
