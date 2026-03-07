/**
 * @description
 * Represents a Ship entity in the system.
 * Ships are vessels owned by characters and can be equipped with modules and implants.
 */
export default interface Ship {
    /**
     * @description Unique identifier for the ship (primary key)
     */
    ID: number;

    /**
     * @description Name of the ship
     */
    Name: string;

    /**
     * @description Type name of the ship (e.g., Frigate, Destroyer, Cruiser)
     */
    TypeName: string;
}
