// Validation
interface Validatable {
	value: string | number;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	min?: number;
	max?: number;
}

export function validate(validatable: Validatable) {
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