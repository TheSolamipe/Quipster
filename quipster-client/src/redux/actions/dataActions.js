import { SET_QUIPS, LOADING_DATA, LIKE_QUIP, UNLIKE_QUIP} from '../types';
import axios from 'axios';

export const getQuips =()=>(dispatch)=>{
    dispatch({type: LOADING_DATA});
    axios.get('/quips')
        .then(res =>{
            dispatch({
                type: SET_QUIPS,
                payload: res.data
            })
        })
        .catch(err =>{
            dispatch({
                type: SET_QUIPS,
                payload: []
            })
        })
}

//like a quip
export const likeQuip = (quipId)=> dispatch => {
    axios.get(`/quip/${quipId}/like`)
        .then(res => {
            dispatch({
                type: LIKE_QUIP,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
}

//unlike a quip
export const unlikeQuip = (quipId)=> dispatch => {
    axios.get(`/quip/${quipId}/unlike`)
        .then(res => {
            dispatch({
                type: UNLIKE_QUIP,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
}