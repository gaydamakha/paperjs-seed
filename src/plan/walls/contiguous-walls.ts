import { Point } from "../point";
import { Walls } from "./walls";

export interface ContiguousWalls extends Walls {
  addCorner(point: Point): void;
}
