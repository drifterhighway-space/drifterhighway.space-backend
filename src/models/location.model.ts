/**
 * @description
 * Represents a Location entity in the system.
 * Locations are spatial references (Solar Systems, Constellations, Regions)
 * in the EVE Online universe.
 */
export default interface Location {
    /**
     * @description Unique identifier for the location (primary key)
     */
    ID: number;

    /**
     * @description Name of the location
     */
    Name: string;

    /**
     * @description Optional reference to the parent constellation
     */
    Constellation?: Location;

    /**
     * @description Optional reference to the parent region
     */
    Region?: Location;
}

/**
 * @description
 * Represents a Solar System location.
 * Solar Systems are the largest spatial divisions containing multiple Constellations.
 */
export interface SolarSystem extends Location {}

/**
 * @description
 * Represents a Constellation location.
 * Constellations are subdivisions of Solar Systems containing multiple Regions.
 */
export interface Constellation extends Location {}

/**
 * @description
 * Represents a Region location.
 * Regions are subdivisions of Constellations and the smallest spatial divisions.
 */
export interface Region extends Location {}
