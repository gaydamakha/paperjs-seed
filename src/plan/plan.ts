import { ContiguousWalls } from "./walls/contiguous-walls";
import { WallsCollection } from "./walls/walls-collection";

export interface Plan {
  internalWalls: WallsCollection;
  externalWalls: ContiguousWalls;
}
