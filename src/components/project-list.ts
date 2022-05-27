import { DragTarget } from "../models/drag-drop.js";
import { Component } from "./base.js";
import { Autobind } from "../decorators/autobind.js";
import { Project } from "../models/project.js";
import { projectState } from "../state/project-state.js";
import { ProjectStatus } from "../models/project.js";
import { ProjectItem } from "./project-item.js";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
	assignedProjects: Project[];

	constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
		this.assignedProjects = [];
    this.configure();
		this.renderContent();
	}

  @Autobind
  dragOverHandler(event: DragEvent): void {
      if(event.dataTransfer &&  event.dataTransfer.types[0] === "text/plain"){
        //Only if we allow preventDefault, js allows us to drop
        // As js normal behaviour is not to allow drop
        event.preventDefault();
        const ulist = this.element.querySelector("ul")!;
        ulist.classList.add("droppable");
      }
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const ulist = this.element.querySelector("ul")!;
    ulist.classList.remove("droppable");
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    if(event.preventDefault) event.preventDefault();
    const newStatus = this.type == "active" ? ProjectStatus.Active:ProjectStatus.Finished;
    projectState.moveProject(event.dataTransfer!.getData("text/plain"), newStatus);
  }

  configure() {

    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((project) => {
				let toHave = false;
				if (this.type == "active" && project.status == ProjectStatus.Active) {
					toHave = true;
				}
				if (
					this.type == "finished" &&
					project.status == ProjectStatus.Finished
				) {
					toHave = true;
				}
				return toHave;
			});
			this.assignedProjects = relevantProjects;
			this.renderProject();
		});


  }

	private renderProject() {
		const listEl = document.getElementById(
			`${this.type}-project-lists`
		)! as HTMLUListElement;
		listEl.textContent = "";

		for (const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
		}
	}

	renderContent() {
		const listId = `${this.type}-project-lists`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector("h2")!.textContent =
			this.type.toUpperCase() + " Projects";
	}

}
