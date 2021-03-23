const {isEmpty, isEmail} = require('./helperFunctions');

exports.validateSignUpData = (data) =>{
    let errors = {};
    if(isEmpty(data.email)){
        errors.email = 'Must not be empty'
    }else if(!isEmail(data.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(data.password))errors.password = 'Must not be empty';
    if(isEmpty(data.confirmPassword))errors.confirmPassword = 'Must not be empty';
    if(data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(data.userHandle)) errors.userHandle = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) =>{
    let errors = {};
    if(isEmpty(data.email)) errors.email = 'Must not be empty';
    if(isEmpty(data.password)) errors.password = 'Must not be empty';

    if(!isEmail(data.email)) errors.email = 'Enter a valid email';
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }

}

exports.reduceUserDetails = (data) =>{
    let userDetails = {};

    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
        //https://website.com
        if(data.website.trim().substring(0,4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        }else userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
};