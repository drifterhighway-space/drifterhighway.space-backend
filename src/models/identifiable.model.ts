/**
 * @description
 * Represents an Identifiable interface for entities that have an ID.
 * This is a base interface used by all models to provide unique identification.
 */
export interface Identifiable {
    /**
     * @description Optional unique identifier (used for read operations, not for inserts)
     */
    ID?: string | number;
}
