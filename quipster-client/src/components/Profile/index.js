import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import dayjs from 'dayjs';


//MUI stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

//Icons
import LocationOn from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import CalendarToday from '@material-ui/icons/CalendarToday';
import EditIcon from '@material-ui/icons/Edit';

//Redux stuff
import {connect} from 'react-redux';
import {uploadImage} from './../../redux/actions/userActions';


const styles = (theme) =>({
    paper: {
        padding: 20
    },
    profile: {
        '& .image-wrapper': {
            textAlign: 'center',
            position: 'relative',
            '& button': {
                position: 'absolute',
                top: '80%',
                left: '70%'
            }
        },
        '& .profile-image': {
            width: 200,
            height: 200,
            objectFit: 'cover',
            maxWidth: '100%',
            borderRadius: '50%'
        },
        '& .profile-details': {
            textAlign: 'center',
            '& span, svg': {
                verticalAlign: 'middle'
            },
            '& a': {
                color: theme.palette.primary.main
            }
        },
        '& hr': {
            border: 'none',
            margin: '0 0 10px 0'
        },
        '& svg.button': {
            '&:hover': {
                cursor: 'pointer'
            }
        }
    },
    buttons: {
        textAlign: 'center',
        '& a': {
            margin: '20px 10px'
        }
    }
});

class Profile extends Component {
    handleImageChange = (event)=>{
        const image =  event.target.files[0];
        //send to server
        const formData = new FormData();
        formData.append('image', image, image.name);
        this.props.uploadImage(formData);
    }
    handleEditPicture =()=>{
        const fileInput = document.getElementById('imageUpload');
        fileInput.click();
    }
    render() {
        const {classes, 
                user:{
                    userData : {credentials},
                    loading,
                    authenticated
                    }
                } = this.props;
        
        let profileMarkup = !loading ? (authenticated ? (
            <Paper className={classes.paper}>
                <div className={classes.profile}>
                    <div className='image-wrapper'>
                        <img src={credentials.imageUrl} alt="profile" className='profile-image'/>
                        <input type='file' id='imageUpload' hidden='hidden' onChange={this.handleImageChange} />
                        <Tooltip title='Edit Profile Picture' placement="top">
                            <IconButton onClick = {this.handleEditPicture} className='button'>
                                <EditIcon color='primary' />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <hr />
                    <div className='profile-details'>
                        <MuiLink component={Link} to={`/users/${credentials.userHandle}`} color='primary' variant='h5'>
                            @{credentials.userHandle}
                        </MuiLink>
                        <hr/>
                        {credentials.bio && <Typography variant='body2'>{credentials.bio}</Typography>}
                        <hr/>
                        {credentials.location && (
                            <Fragment>
                                <LocationOn color="primary" /> <span>{credentials.location}</span>
                                <hr/>
                            </Fragment> 
                        )}
                        {credentials.website && (
                            <Fragment>
                                <LinkIcon color='primary'/>
                                <a href={credentials.website} target='_blank' rel="noopener noreferrer">
                                    {' '}{credentials.website}
                                </a>
                                <hr/>
                            </Fragment>
                        )}
                        <CalendarToday color='primary' />{' '}
                        <span>Joined {dayjs(credentials.createdAt).format('MMM YYYY')}</span>
                    </div>
                </div>
            </Paper>
        ) : (
            <Paper className={classes.paper}>
                <Typography variant='body2' align='center'>
                    No profile found, please login again
                </Typography>
                <div className={classes.buttons}>
                    <Button variant='contained' color='primary' component={Link} to='/login'>
                        Login
                    </Button>
                    <Button variant='contained' color='secondary' component={Link} to='/signup'>
                        Signup
                    </Button>
                </div>
            </Paper>
        )) : (<p> loading... </p>)

        return profileMarkup;
    }
}

Profile.propTypes ={
    user: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    uploadImage: PropTypes.func.isRequired
}; 

const mapStateToProps = (state) =>({
    user: state.user
});

const mapActionsToProps = {
    uploadImage
}
export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Profile));
