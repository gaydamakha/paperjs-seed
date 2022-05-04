import { icon } from "@fortawesome/fontawesome-svg-core";
import { paperPointToPoint, pointToPaperPoint } from "../plan/paper-plan";
import { Walls } from "../plan/walls/walls";
import { PaperTool } from "../toolbar";
import { isEqual } from "lodash";
import { faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { Drawer } from "../utils";
import { Point } from "../plan/point";

export class ExternalWallsBuilderTool extends PaperTool {
  private static dragDistance = 20;
  private static minVectorLength = 10;
  private static dragLineId = "DRAG_LINE";
  private static dashedLineId = "DASHED_LINE";
  private startVector: paper.Point | null = null;
  private currentVector: paper.Point | null = null;
  private previousVector: paper.Point | null = null;
  public readonly name = "Construire des murs externes";

  public readonly icon = icon(faDrawPolygon);

  public constructor(
    private readonly drawer: Drawer,
    private readonly walls: Walls,
    private readonly wallsAngleRestrictFactor: number
  ) {
    super();
    this.paperTool.onMouseDown = this.onMouseDown.bind(this);
    this.paperTool.onMouseDrag = this.onMouseDrag.bind(this);
    this.paperTool.onMouseUp = this.onMouseUp.bind(this);
    this.paperTool.onKeyDown = this.onKeyDown.bind(this);
  }

  private drawDashedLine(start: Point, end: Point): void {
    this.drawer.drawLine(
      ExternalWallsBuilderTool.dashedLineId,
      start,
      end,
      "black",
      { dashLength: 1, gapLength: 2 }
    );
  }

  public onMouseDown(event: paper.ToolEvent): void {
    this.processCursorPosition(event.point);
  }

  public onMouseDrag(event: paper.ToolEvent): void {
    this.processCursorPosition(event.point);
  }

  private processCursorPosition(point: paper.Point) {
    if (this.startVector === null) {
      this.startVector = point.round();
    }
    if (
      this.startVector!.getDistance(point) >
      ExternalWallsBuilderTool.minVectorLength
    ) {
      this.currentVector = this.restrictVectorAngle(
        point.subtract(this.startVector!),
        this.wallsAngleRestrictFactor
      )
        .add(this.startVector!)
        .round();
      const nearPoint = this.walls.getCornerNear(
        paperPointToPoint(point),
        ExternalWallsBuilderTool.dragDistance
      );
      if (nearPoint !== null) {
        this.currentVector = pointToPaperPoint(nearPoint);
      }
      const cornerOnX = this.walls.getCornerOnX(
        this.currentVector,
        ExternalWallsBuilderTool.dragDistance
      );
      const cornerOnY = this.walls.getCornerOnY(
        this.currentVector,
        ExternalWallsBuilderTool.dragDistance
      );
      let clean = true;
      if (
        cornerOnX !== null &&
        !isEqual(cornerOnX, paperPointToPoint(this.startVector))
      ) {
        clean = false;
        this.currentVector.y = cornerOnX.y;
        this.drawDashedLine(paperPointToPoint(this.currentVector), cornerOnX);
      }
      if (
        cornerOnY !== null &&
        !isEqual(cornerOnY, paperPointToPoint(this.startVector))
      ) {
        clean = false;
        this.currentVector.x = cornerOnY.x;
        this.drawDashedLine(paperPointToPoint(this.currentVector), cornerOnY);
      }
      if (clean) {
        this.drawer.erase(ExternalWallsBuilderTool.dashedLineId);
      }

      this.drawer.drawLine(
        ExternalWallsBuilderTool.dragLineId,
        paperPointToPoint(this.startVector!),
        paperPointToPoint(this.currentVector),
        "#e4141b",
        null
      );
    }
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
    if (this.walls.isEmpty()) {
      this.walls.addCorner(pointToPaperPoint(this.startVector!));
    }
    this.walls.addCorner(pointToPaperPoint(this.currentVector!));
    // Memorize previous point
    this.previousVector = this.startVector;
    this.startVector = this.currentVector;
    this.drawer.erase(ExternalWallsBuilderTool.dragLineId);
    this.drawer.erase(ExternalWallsBuilderTool.dashedLineId);
  }

  public onKeyDown(event: any): void {
    if (event.modifiers.control && event.key.charCodeAt(0) === 122) {
      this.walls.removeLastCorner();
      if (this.walls.isEmpty()) {
        this.startVector = null;
        this.previousVector = null;
      } else {
        this.startVector = this.previousVector;
        let walls = this.walls.getCorners();
        let previousPoint = walls.at(walls.length - 2) ?? null;
        this.previousVector = previousPoint
          ? pointToPaperPoint(previousPoint)
          : null;
      }
    }
  }
}
