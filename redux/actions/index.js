import { getDoc, doc, collection, query, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE, USER_FOLLOWING_STATE_CHANGE, USERS_DATA_STATE_CHANGE, USERS_POSTS_STATE_CHANGE, CLEAR_DATA, USERS_LIKES_STATE_CHANGE } from "../constants";

export function clearData() {
    return ((dispatch) => {
        dispatch({type: CLEAR_DATA})
    })
}

export function fetchUser() {
    return async (dispatch) => {
        try {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                dispatch({
                    type: USER_STATE_CHANGE,
                    currentUser: docSnap.data(),
                });
            } else {
                console.log('No such document');
                console.log('User ID: ' + auth.currentUser.uid)
                console.log('User email: ' + auth.currentUser.email)
            }
        } catch (error) {
            console.error('Error fetching user: ', error);
        }
    };
}

export function fetchUserPosts() {
    return async (dispatch) => {
        try {
            const q = query(collection(db, `posts/${auth.currentUser.uid}/userPosts`), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q)
            
            let posts = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })
            dispatch({
                type: USER_POSTS_STATE_CHANGE,
                posts
            });
        } catch (error) {
            console.error('Error fetching posts: ', error);
        }
    };
}

export function fetchUserFollowing() {
    return (dispatch) => {
        try {
            const ref = collection(db, `following/${auth.currentUser.uid}/userFollowing`)
            onSnapshot(ref, (snapshot) => {
                let following = snapshot.docs.map(doc => {
                    const id = doc.id;
                    return id;
                });

                dispatch({
                    type: USER_FOLLOWING_STATE_CHANGE,
                    following
                });
                for (let i = 0; i < following.length; i++) {
                    dispatch(fetchUsersData(following[i], true));
                }
            });
        } catch (error) {
            console.error('Error fetching following: ', error);
        }
    };
}

export function fetchUsersData(uid, getPosts) {
    return ((dispatch, getState) => {
        const found = getState().usersState.users.some(el => el.uid === uid);

        if (!found) {
            const docRef = doc(db, "users", uid);
            getDoc(docRef).then((snapshot) => {
                if (snapshot.exists()) {
                    let user = snapshot.data();
                    user.uid = snapshot.id;

                    dispatch({
                        type: USERS_DATA_STATE_CHANGE,
                        user
                    });
                } else {
                    console.log('No such document');
                    console.log('User ID: ' + auth.currentUser.uid)
                    console.log('User email: ' + auth.currentUser.email)
                }
            });
            if (getPosts) {
                dispatch(fetchUsersFollowingPosts(uid));
            }
        }
    })
}

export function fetchUsersFollowingPosts(uid) {
    return (dispatch, getState) => {
        try {
            const q = query(collection(db, `posts/${uid}/userPosts`), orderBy('createdAt', 'desc'));
             getDocs(q).then((snapshot) => {
                const uid = snapshot.docs[0].ref.path.split('/')[1];
                const user = getState().usersState.users.find(el => el.uid === uid);

                let posts = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id;
                    return { id, ...data, user }
                });

                for (let i = 0; i < posts.length; i++) {
                    dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
                }

                dispatch({
                    type: USERS_POSTS_STATE_CHANGE,
                    posts,
                    uid
                });
             })
        } catch (error) {
            console.error('Error fetching users following posts: ', error);
        }
    };
}


export function fetchUsersFollowingLikes(uid, postId) {
    return (dispatch) => {
        try {
            onSnapshot(
                doc(db, `posts/${uid}/userPosts/${postId}/likes/${auth.currentUser.uid}`), (doc, snapshot) => {
                    const postId = snapshot.ZE.path.segments[3];

                    let currentUserLike = false;
                    if (snapshot.exists) {
                        currentUserLike = true;
                    }

                    dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike})
                })
        } catch (error) {
            console.error('Error fetching users following likes: ', error);
        }
    };
}
