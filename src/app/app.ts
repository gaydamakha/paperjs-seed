import * as paper from "paper";
import { Plan } from "../plan";
import { PaperPlan } from "../plan/paper-plan";
import { PaperContiguousWalls } from "../plan/walls/paper-contiguous-walls";
import { PaperWallsCollection } from "../plan/walls/paper-walls-collection";
import { Toolbar } from "../toolbar";
import { ToolboxesContainer } from "../toolbox";
import { ColorToolbox, SaveToolbox } from "../toolboxes";
import { FillTool } from "../tools";
import { ExternalWallsBuilderTool } from "../tools/external-wall-builder-tool";
import { InternalWallsBuilderTool } from "../tools/internal-wall-builder-tool";
import { PaperDrawer } from "../utils";
import "./app.scss";

export class App {
  public static create(host: HTMLElement): App {
    host.classList.add("app");

    return new App(host);
  }

  private constructor(private readonly element: HTMLElement) {
    const colorToolbox = new ColorToolbox();

    const toolboxes = ToolboxesContainer.create(element);

    toolboxes.addToolbox(colorToolbox);
    toolboxes.addToolbox(new SaveToolbox());

    const toolbar = Toolbar.create(element);

    toolbar.addTool(new FillTool(colorToolbox));

    const canvas = document.createElement("canvas");
    this.element.appendChild(canvas);

    paper.setup(canvas);

    paper.view.center = new paper.Point(0, 0);

    const plan = this.initializePlan();

    toolbar.addTool(
      new ExternalWallsBuilderTool(new PaperDrawer(), plan.externalWalls, 4)
    );

    toolbar.addTool(
      new InternalWallsBuilderTool(
        new PaperDrawer(),
        plan.internalWalls,
        plan.externalWalls,
        4
      )
    );
  }

  private initializePlan(): Plan {
    return new PaperPlan(
      new PaperWallsCollection("#44cbed", 2),
      new PaperContiguousWalls("#4477ed", 5)
    );
  }
}
