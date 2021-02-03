export const enum CALCFlag {
    UNDEFINED = 0,
    TOP = 1,
    LEFT = 2,
    WIDTH = 4,
    HEIGHT = 8
}
export interface BoxMetrics {
    /**
     * Top
     */
    t: number;
    /**
     * Left
     */
    l: number;
    /**
     * Width
     */
    w: number;
    /**
     * Height
     */
    h: number;
    /**
     * DEFINED Flags
     */
    defined: CALCFlag;
    color?: string[];
}
