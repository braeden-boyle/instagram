import { USERS_DATA_STATE_CHANGE, USERS_POSTS_STATE_CHANGE } from '../constants'


const initialState = {
    users: [],
    usersLoaded: 0
}

export const users = (state = initialState, action) => {
    switch(action.type){
        case USERS_DATA_STATE_CHANGE:
            return {
                ...state,
                users: [...state.users, action.user]
            }
        case USERS_POSTS_STATE_CHANGE:
            return {
                ...state,
                posts: action.posts
            }
        default:
            return state;
    }
}