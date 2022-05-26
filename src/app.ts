// Drag and Drop Interface
interface Draggable{
  // Handle Drag Start
  dragStarteHandler(event: DragEvent): void;
  // Handle Drag end
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget{
  // Signal browser that the thing we are dragging over is a valid drag target
  dragOverHandler(event: DragEvent):void;
  // To react to drop
  dropHandler(event: DragEvent):void;
  // For visual feedback
  dragLeaveHandler(event: DragEvent):void;
}

// Project
enum ProjectStatus {
	Active,
	Finished,
}
class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

//Listener
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
	protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}

}

//Project state management
class ProjectState extends State<Project>{
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

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
	value: string | number;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	min?: number;
	max?: number;
}

function validate(validatable: Validatable) {
	let isValid = true;

	if (validatable.required) {
		isValid = isValid && validatable.value.toString().trim().length != 0;
	}

	if (validatable.minLength != null && typeof validatable.value == "string") {
		isValid =
			isValid && validatable.value.trim().length >= validatable.minLength;
	}

	if (validatable.maxLength != null && typeof validatable.value == "string") {
		isValid =
			isValid && validatable.value.trim().length <= validatable.maxLength;
	}

	if (validatable.max != null && typeof validatable.value == "number") {
		isValid = isValid && validatable.value <= validatable.max;
	}

	if (validatable.min != null && typeof validatable.value == "number") {
		isValid = isValid && validatable.value >= validatable.min;
	}

	return isValid;
}

// Autobind decorator
// To bind submitHandler's this to the class
function Autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		enumerable: false,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		},
	};
	return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
    insertAtStart: boolean,
		newElementId?: string,
	) {
    this.templateElement = document.getElementById(
			templateId
		) as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId) as T;
    const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as U;
		if(newElementId) this.element.id = newElementId;

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
		this.hostElement.insertAdjacentElement(insertAtStart? "afterbegin": "beforeend", this.element);
	}

  abstract configure():void;
  abstract renderContent():void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement;
	descInputElement;
	peopleInputElement;

	constructor() {
    super("project-input", "app", true);

		this.titleInputElement = this.element.querySelector(
			"#title"
		) as HTMLInputElement;
		this.descInputElement = this.element.querySelector(
			"#description"
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			"#people"
		) as HTMLInputElement;
		this.configure();
	}

  renderContent(): void {
      
  }

  configure() {
		this.element.addEventListener("submit", this.submitHandler);
	}

	private gatherUserInput(): [string, string, number] | void {
		const enteredTitle = this.titleInputElement.value;
		const entereDesc = this.descInputElement.value;
		const enteredPeople = this.peopleInputElement.value;

		if (
			!validate({ value: enteredTitle, required: true, minLength: 1 }) ||
			!validate({ value: entereDesc, required: true, minLength: 1 }) ||
			!validate({ value: +enteredPeople, required: true, min: 1 })
		) {
			alert("Invalid Inputs");
			return;
		}

		return [enteredTitle, entereDesc, +enteredPeople];
	}

	private clearInput() {
		this.titleInputElement.value = "";
		this.descInputElement.value = "";
		this.peopleInputElement.value = "";
	}

	@Autobind
	private submitHandler(e: Event) {
		e.preventDefault();
		const userInput = this.gatherUserInput();
		this.clearInput();
		if (Array.isArray(userInput)) {
			const [title, desc, people] = userInput;
			projectState.addProject(title, desc, people);
			console.log(title, desc, people);
		}
	}
}

const project = new ProjectInput();
const activeLists = new ProjectList("active");
const finishedLists = new ProjectList("finished");
