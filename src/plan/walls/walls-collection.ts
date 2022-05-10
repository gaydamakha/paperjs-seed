import { Point } from "../point";
import { Walls } from "./walls";

export interface WallsCollection extends Walls {
  addWall(start: Point, end: Point): void;
}
