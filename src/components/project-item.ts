import { Component } from "./base";
import { Draggable } from "../models/drag-drop";
import { Project } from "../models/project";
import { Autobind } from "../decorators/autobind";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons(){
    if(this.project.people == 1){
      return "1 Person";
    }else{
      return `${this.project.people} Persons`;
    }
  }
  constructor(hostId: string, project: Project){
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStarteHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {
      console.log("Drag End");
  }

  configure(): void {
      this.element.addEventListener("dragstart", this.dragStarteHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent(): void {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("p")!.textContent = this.project.description;
      this.element.querySelector("h3")!.textContent = this.persons + " Assigned";
  }
}