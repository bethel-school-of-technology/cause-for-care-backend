const actualEmail = (email) => {
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (email.match(regEx)) return true;
	else return false;
};
const emptyField = (string) => {
	if (string.trim() === '') return true;
	else return false;
};

//HELPER FUNCTIONS FOR EMPTY FIELDS
exports.validOrgSignupData = (data) => {
	let errors = {};

	if (emptyField(data.email)) {
		errors.email = 'needs one';
	} else if (!actualEmail(data.email)) {
		errors.email = 'gotta be an actual email';
	}
	if (emptyField(data.password)) errors.password = 'Needs one';
	if (data.password !== data.confirmPassword)
		errors.confirmPassword = 'messed something up, gotta match';
	if (emptyField(data.orgHandle)) errors.orgHandle = 'Needs one';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};

exports.validSignupData = (data) => {
	let errors = {};

	if (emptyField(data.email)) {
		errors.email = 'needs one';
	} else if (!actualEmail(data.email)) {
		errors.email = 'gotta be an actual email';
	}
	if (emptyField(data.password)) errors.password = 'Needs one';
	if (data.password !== data.confirmPassword)
		errors.confirmPassword = 'messed something up, gotta match';
	if (emptyField(data.userHandle)) errors.userHandle = 'Needs one';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};

exports.validLoginData = (data) => {
	let errors = {};

	if (emptyField(data.email)) errors.email = 'needs one';
	if (emptyField(data.password)) errors.password = 'needs one';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false
	};
};
