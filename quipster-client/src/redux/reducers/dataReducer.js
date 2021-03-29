import { SET_QUIPS, LIKE_QUIP, UNLIKE_QUIP, LOADING_DATA, LOADING_UI} from '../types';

const initialState= {
    quips: [],
    quip: {},
    loading: false
};

export default function(state= initialState, action){
    switch(action.type){
        case LOADING_DATA :
            return {
                ...state,
                loading: true
            }
        case SET_QUIPS :
            return {
                ...state,
                screams: action.payload,
                loading: false
            }
        case LIKE_QUIP:
        case UNLIKE_QUIP:
            let index = state.quips.findIndex((quip) => quip.quipId === action.payload.quipId);
            state.quips[index] = action.payload;
            return {
                ...state
            }

    }
}
