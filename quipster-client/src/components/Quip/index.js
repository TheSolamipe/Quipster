import React, { Component } from 'react'
import './styles.css';
import withStyles from '@material-ui/core/styles/withStyles';
import {Link} from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import MyButton from '../../utils/MyButton';

//MUI Stuff
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

//Icons
import ChatIcon from '@material-ui/icons/Chat';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

//redux
import { connect } from 'react-redux';
import {likeQuip, unlikeQuip} from '../../redux/actions/dataActions';


const styles = {
    card: {
        display: 'flex',
        marginBottom: 20,
    },
    image:{
        minWidth: 200,
        objectFit: 'cover'
    },
    content:{
        padding: 25
    }
}

class Quip extends Component {
    likedQuip = () =>{
        if(this.props.user.userData.likes && this.props.user.userData.likes.find(like => like.quidId === this.props.quip.quipId))
            return true;
            else return false;
    };
    likeQuip = ()=>{
        this.props.likeQuip(this.props.quip.quipId);
    }
    unlikeQuip = ()=>{
        this.props.unlikeQuip(this.props.quip.quipId);
    }
    render() {
            dayjs.extend(relativeTime)
            const { classes, quip: {userImage, body, userHandle, createdAt, quipId, likeCount, commentCount},
                    user: {
                        authenticated
                    }
            } = this.props;
            const likeButton = !authenticated ? (
                <MyButton tip="like">
                    <Link to="/login">
                        <FavoriteBorder color="primary" />
                    </Link>
                </MyButton>
            ): (
                this.likedQuip() ? (
                    <MyButton tip="Undo like" onClick={this.unlikeQuip}>
                        <FavoriteIcon color="primary" />
                    </MyButton>
                ): (
                    <MyButton tip="Like" onClick={this.likeQuip}>
                        <FavoriteBorder color="primary" />
                    </MyButton>
                )
            )
        return (
            <Card className={classes.card}>
                <CardMedia 
                    image={userImage} 
                    title= 'Profile image' 
                    className={classes.image}
                />
                <CardContent className={classes.content}>
                    <Typography variant="h5" component={Link} to={`/users/${userHandle}`} color='primary'>{userHandle}</Typography>
                    <Typography varient='body2' color="textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography varient='body1'>{body}</Typography>
                    {likeButton}
                    <span>{likeCount} likes</span>
                    <MyButton tip="comments">
                        <ChatIcon color='primary' />
                    </MyButton>
                    <span>{commentCount} comments</span>
                </CardContent>
            </Card>
        )
    }
}

Quip.propTypes ={
    likeQuip : PropTypes.func.isRequired,
    unlikeQuip : PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    quip: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}
const mapActionsToProps = {
    likeQuip, unlikeQuip
}
const mapStateToProps = state =>({
    user: state.user
})
export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Quip));
