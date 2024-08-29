import { getDoc, doc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from "../constants";

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
            const q = query(collection(db, `posts/${auth.currentUser.uid}/userPosts`), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q)
            
            let posts = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            })
            console.log(posts);
            dispatch({
                type: USER_POSTS_STATE_CHANGE,
                posts
            });
        } catch (error) {
            console.error('Error fetching posts: ', error);
        }
    };
}