import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

export function fetchUser() {
    return async (dispatch) => {
        try {
            const docRef = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                dispatch({
                    type: USER_STATE_CHANGE,
                    currentUser : docSnap.data(),
                });
            } else {
                console.log('No such document');
            }
        } catch (error) {
            console.error('Error fetching user: ', error);
        }
    };
}