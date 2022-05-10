import * as paper from "paper";
import { paperPointToPoint, pointToPaperPoint } from "../paper-plan";
import { Point } from "../point";
import { WallsCollection } from "./walls-collection";

export class PaperWallsCollection implements WallsCollection {
  private walls: paper.Group = new paper.Group();

  public constructor(
    private readonly color: string,
    private readonly width: number
  ) {}

  public getPointAtWallNear(point: Point, radius: number): Point | null {
    const paperPoint = pointToPaperPoint(point);
    for (let item of this.walls.children) {
      if (item instanceof paper.Path.Line) {
        const nearest = item.getNearestPoint(paperPoint);
        if (nearest !== null && nearest.getDistance(paperPoint) <= radius) {
          return paperPointToPoint(nearest);
        }
      }
    }
    return null;
  }
  public getCornerOnX(point: Point, radius: number = 0): Point | null {
    return (
      this.getCorners().find((p: Point) => {
        return Math.abs(p.y - point.y) <= radius;
      }) ?? null
    );
  }
  public getCornerOnY(point: Point, radius: number = 0): Point | null {
    return (
      this.getCorners().find((p: Point) => {
        return Math.abs(p.x - point.x) <= radius;
      }) ?? null
    );
  }
  public getCornerNear(point: Point, radius: number): Point | null {
    let paperPoint = pointToPaperPoint(point);
    return (
      this.getCorners().find((p: Point) => {
        return pointToPaperPoint(p).getDistance(paperPoint) <= radius;
      }) ?? null
    );
  }

  public getCorners(): Point[] {
    const corners: Point[] = [];
    this.walls.children.forEach((item: paper.Item) => {
      if (item instanceof paper.Path.Line) {
        corners.push(paperPointToPoint(item.segments[0].point));
        corners.push(paperPointToPoint(item.segments[1].point));
      }
    });
    return corners;
  }

  public isEmpty(): boolean {
    return this.walls.isEmpty();
  }

  public addWall(start: Point, end: Point): void {
    const line = new paper.Path.Line(
      pointToPaperPoint(start),
      pointToPaperPoint(end)
    );
    line.strokeColor = new paper.Color(this.color);
    line.strokeWidth = this.width;
    line.strokeJoin = "round";
    line.strokeCap = "round";
    this.walls.addChild(line);
  }

  public removeLast(): void {
    if (!this.walls.isEmpty()) {
      this.walls.removeChildren(this.walls.children.length - 1);
    }
  }
}
