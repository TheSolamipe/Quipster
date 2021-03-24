import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import AppIcon from './../images/quipster.png';

//Mui stuff
import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

//Redux stuff
import {connect} from 'react-redux';
import {registerUser} from './../redux/actions/userActions';


const styles = (theme) =>({
    ...theme.spreadThis
})

class signup extends Component {
    constructor(){
        super();
        this.state ={
            email: '',
            userHandle: '',
            password: '',
            confirmPassword: '',
            errors: {}
        }
    }
    componentWillReceiveProps =(nextProps)=>{
        if(nextProps.UI.errors){
            this.setState({errors: nextProps.UI.errors});
        } 
    }
    handleSubmit =(event)=>{
        event.preventDefault();
        const {email, userHandle, password, confirmPassword} = this.state
        const newUserData ={
            email, userHandle, password, confirmPassword
        }
        this.props.registerUser(newUserData, this.props.history);
    }
    handleChange =(event)=>{
        this.setState({
            [event.target.name] : event.target.value
        });
    }
    render() {
        const {classes, UI: {loading}} = this.props;
        const {errors} = this.state;
        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={AppIcon} alt="smiley" className={classes.image} />
                    <Typography variant='h3' className={classes.pageTitle}>SignUp</Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField  type='text' id='userHandle' label='User Handle' name='userHandle' value={this.state.userHandle}
                                    className={classes.textField} onChange={this.handleChange}
                                    helperText={errors.userHandle} error={errors.userHandle ? true : false } fullWidth
                        />
                        <TextField  type='email' id='email' label='Email' name='email' value={this.state.email}
                                    className={classes.textField} onChange={this.handleChange}
                                    helperText={errors.email} error={errors.email ? true : false } fullWidth
                        />
                        <TextField  type='password' id='password' label='Password' name='password' value={this.state.password}
                                    className={classes.textField} onChange={this.handleChange}
                                    helperText={errors.password} error={errors.password ? true : false } fullWidth
                        />
                        <TextField  type='password' id='confirmPassword' label='Confirm Password' name='confirmPassword' value={this.state.confirmPassword}
                                    className={classes.textField} onChange={this.handleChange}
                                    helperText={errors.confirmPassword} error={errors.confirmPassword ? true : false } fullWidth
                        />
                        {}
                        <Button type='submit' variant='contained' color='secondary' className={classes.button} disabled={loading}>
                            Sign Up {loading && (<CircularProgress size={30} className={classes.progress} />)}
                        </Button> <br/>
                        <small>Already have an Account? <Link to="/login">Login</Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        )
    }
}

signup.propTypes = {
    classes: PropTypes.object.isRequired,
    registerUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired,
}

const mapActionsToProps = {
    registerUser,
}
const mapStateToProps =(state)=> ({
    user: state.user,
    UI: state.UI
})

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(signup));
