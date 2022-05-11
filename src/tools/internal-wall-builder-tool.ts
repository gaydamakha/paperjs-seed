import { icon } from "@fortawesome/fontawesome-svg-core";
import { paperPointToPoint, pointToPaperPoint } from "../plan/paper-plan";
import { Walls } from "../plan/walls/walls";
import { PaperTool } from "../toolbar";
import { isEqual } from "lodash";
import { faTrowelBricks } from "@fortawesome/free-solid-svg-icons";
import { Drawer } from "../utils";
import { Point } from "../plan/point";
import { WallsCollection } from "../plan/walls/walls-collection";

export class InternalWallsBuilderTool extends PaperTool {
  private static dragDistance = 20;
  private static minVectorLength = 10;
  private static dragLineId = "DRAG_LINE";
  private static dashedLineId = "DASHED_LINE";
  private startVector: paper.Point | null = null;
  private currentVector: paper.Point | null = null;
  public readonly name = "Construire des murs internes";

  public readonly icon = icon(faTrowelBricks);

  public constructor(
    private readonly drawer: Drawer,
    private readonly internalWalls: WallsCollection,
    private readonly externalWalls: Walls,
    private readonly wallsAngleRestrictFactor: number
  ) {
    super();
    this.paperTool.onMouseDown = this.onMouseDown.bind(this);
    this.paperTool.onMouseDrag = this.onMouseDrag.bind(this);
    this.paperTool.onMouseUp = this.onMouseUp.bind(this);
    this.paperTool.onKeyDown = this.onKeyDown.bind(this);
  }

  private drawDashedLine(start: Point, end: Point): void {
    this.drawer.drawLine(InternalWallsBuilderTool.dashedLineId, {
      start: start,
      end: end,
      color: "black",
      dashProps: { dashLength: 1, gapLength: 2 },
    });
  }

  public onMouseDown(event: paper.ToolEvent): void {
    if (this.hasNearWall(event.point.round())) {
      this.startVector = this.dragPointToNearWall(event.point.round());
    }
  }

  public onMouseDrag(event: paper.ToolEvent): void {
    if (this.startVector !== null) {
      this.processCursorPosition(event.point);
    }
  }

  private processCursorPosition(point: paper.Point) {
    this.currentVector = this.restrictVectorAngle(
      point.subtract(this.startVector!),
      this.wallsAngleRestrictFactor
    )
      .add(this.startVector!)
      .round();
    this.currentVector = this.dragPointToNearWall(this.currentVector);
    if (
      this.startVector!.getDistance(this.currentVector) >
      InternalWallsBuilderTool.minVectorLength
    ) {
      this.drawer.drawLine(InternalWallsBuilderTool.dragLineId, {
        start: paperPointToPoint(this.startVector!),
        end: paperPointToPoint(this.currentVector),
        color: "#e4141b",
      });
      const cornerOnX = this.internalWalls.getCornerOnX(
        this.currentVector,
        InternalWallsBuilderTool.dragDistance
      );
      const cornerOnY = this.internalWalls.getCornerOnY(
        this.currentVector,
        InternalWallsBuilderTool.dragDistance
      );
      let clean = true;
      if (
        cornerOnX !== null &&
        !isEqual(cornerOnX, paperPointToPoint(this.startVector!))
      ) {
        clean = false;
        this.currentVector.y = cornerOnX.y;
        this.drawDashedLine(paperPointToPoint(this.currentVector), cornerOnX);
      }
      if (
        cornerOnY !== null &&
        !isEqual(cornerOnY, paperPointToPoint(this.startVector!))
      ) {
        clean = false;
        this.currentVector.x = cornerOnY.x;
        this.drawDashedLine(paperPointToPoint(this.currentVector), cornerOnY);
      }
      if (clean) {
        this.drawer.erase(InternalWallsBuilderTool.dashedLineId);
      }
    }
  }

  private dragPointToNearWall(point: paper.Point): paper.Point {
    const nearExternalPoint = this.externalWalls.getPointAtWallNear(
      paperPointToPoint(point),
      InternalWallsBuilderTool.dragDistance
    );
    if (nearExternalPoint !== null) {
      return pointToPaperPoint(nearExternalPoint);
    }
    const nearInternalPoint = this.internalWalls.getPointAtWallNear(
      paperPointToPoint(point),
      InternalWallsBuilderTool.dragDistance
    );
    if (nearInternalPoint !== null) {
      return pointToPaperPoint(nearInternalPoint);
    }
    return point;
  }

  private hasNearWall(point: paper.Point): boolean {
    const nearExternalPoint = this.externalWalls.getPointAtWallNear(
      paperPointToPoint(point),
      InternalWallsBuilderTool.dragDistance
    );
    const nearInternalPoint = this.internalWalls.getPointAtWallNear(
      paperPointToPoint(point),
      InternalWallsBuilderTool.dragDistance
    );
    return nearExternalPoint !== null || nearInternalPoint !== null;
  }

  private restrictVectorAngle(
    vector: paper.Point,
    restrictFactor: number
  ): paper.Point {
    let absoluteAngle = vector.angle;
    if (absoluteAngle < 0) {
      absoluteAngle += 360;
    }
    vector.angle = this.restrictAngle(absoluteAngle, restrictFactor);
    return vector;
  }

  /**
   * @param angle between 0 and 360
   * @param restrictFactor minimum 0
   * @returns
   */
  private restrictAngle(angle: number, restrictFactor: number): number {
    let degreeThreshold = 360 / restrictFactor;
    return (
      degreeThreshold *
      Math.floor((angle + degreeThreshold / 2) / degreeThreshold)
    );
  }

  public onMouseUp(_event: paper.ToolEvent) {
    if (
      this.startVector !== null &&
      this.currentVector !== null &&
      this.currentVector.getDistance(this.startVector) >
        InternalWallsBuilderTool.minVectorLength
    ) {
      this.internalWalls.addWall(
        paperPointToPoint(this.startVector!),
        paperPointToPoint(this.currentVector!)
      );
      this.startVector = null;
    }
    this.drawer.erase(InternalWallsBuilderTool.dragLineId);
    this.drawer.erase(InternalWallsBuilderTool.dashedLineId);
  }

  public onKeyDown(event: any): void {
    if (event.modifiers.control && event.key.charCodeAt(0) === 122) {
      this.internalWalls.removeLast();
    }
  }
}
