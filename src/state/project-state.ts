import {Project, ProjectStatus} from "../models/project"

//Listener
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
	protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}

}

//Project state management
export class ProjectState extends State<Project>{
	private projects: Project[] = [];
	private static instance: ProjectState;

	private constructor() {
    super();
  }

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}

		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, people: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			people,
			ProjectStatus.Active
		);
		this.projects.push(newProject);
		console.log(this.projects);
    this.updateState();
	}

  moveProject(projectId: string, newStatus: ProjectStatus){
    const project = this.projects.find(pr => pr.id == projectId)
    if(project && project?.status!= newStatus){
      project.status = newStatus;
      this.updateState();
    } 
  }

  updateState(){
    for (const listenerFn of this.listeners) {
			//Passsing .slice so that we pass a copy not the reference to original array
			listenerFn(this.projects.slice());
		}
  }

}

export const projectState = ProjectState.getInstance();
