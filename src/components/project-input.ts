import { Component } from "./base.js";
import { validate } from "../utils/validation.js";
import { Autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
