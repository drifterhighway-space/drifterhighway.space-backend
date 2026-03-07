/**
 * @description
 * Represents a GroupEntity interface for organizational entities.
 * GroupEntity is used for entities that belong to a hierarchical structure
 * (e.g., Corporation and Alliance types).
 */
export interface GroupEntity {
    /**
     * @description Unique identifier for the group entity (primary key)
     */
    ID: number;

    /**
     * @description Name of the group entity
     */
    Name: String;

    /**
     * @description Type of group entity (Corporation or Alliance)
     */
    Type: GroupEntityType;

    /**
     * @description Optional parent group entity reference
     */
    Parent?: GroupEntity;
}

/**
 * @description Enumeration representing the type of group entity
 */
export enum GroupEntityType {
    /**
     * @description Corporation type for corporate entities
     */
    Corporation,
    /**
     * @description Alliance type for alliance entities
     */
    Alliance,
}
