import {SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED, LOADING_USER, LIKE_QUIP, UNLIKE_QUIP} from './../types';

const initialState = {
    authenticated: false,
    loading: false,
    userData: {},
    likes: [],
    notifications: []
};

export default function(state= initialState, action){
    switch(action.type){
        case SET_AUTHENTICATED:
            return {
                ...state,
                authenticated: true
            };
        case SET_UNAUTHENTICATED:
            return initialState;
        case SET_USER:
            return {
                authenticated: true,
                loading: false,
                ...action.payload,
            };
        case LOADING_USER: 
            return {
                ...state,
                loading: true
            };
        case LIKE_QUIP:
            return {
                ...state,
                likes: [
                    ...state.likes,
                    {
                        userHandle: state.userData.userHandle,
                        quipId: action.payload.quipId
                    }
                ]
            };
        case UNLIKE_QUIP: 
            return {
                ...state,
                likes: state.likes.filter(
                    like => like.quipId === action.payload.quipId
                )
            };
        default: 
            return state;
    }
}