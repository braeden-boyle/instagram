import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Button, TextInput } from 'react-native'
import { db, auth } from '../../firebaseConfig'
import { addDoc, collection, doc, getDocs } from 'firebase/firestore'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUsersData } from '../../redux/actions'

function Comment(props) {
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {

        function matchUserToComment(comments) {
            for (let i = 0; i < comments.length; i++) {

                if (comments[i].hasOwnProperty('user')) {
                    continue;
                }

                const user = props.users.find(x => x.uid === comments[i].creator);
                if (user == undefined) {
                    props.fetchUsersData(comments[i].creator, false);
                } else {
                    comments[i].user = user;
                }
            }
            setComments(comments);
        }

        if (props.route.params.postId !== postId) {
            const q = collection(db, `posts/${props.route.params.uid}/userPosts/${props.route.params.postId}/comments`);
            getDocs(q).then((snapshot) => {
                let comments = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id
                    return {id, ...data}
                });
                matchUserToComment(comments);
            });
            setPostId(props.route.params.postId);
        } else {
            matchUserToComment(comments);
        }
    }, [props.route.params.postId, props.users])

    const onCommentSend = async () => {
        const docRef = await addDoc(collection(db, `posts/${props.route.params.uid}/userPosts/${props.route.params.postId}/comments`), {
            creator: auth.currentUser.uid,
            text
        });
    }

    return (
        <View>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({item}) => (
                    <View>
                        {item.user !== undefined ? 
                        <Text>
                            <Text style={{fontWeight: 'bold'}}>
                                {item.user.name}
                            </Text>
                            <Text> {item.text}</Text>
                        </Text>
                    : null }
                    </View>
                )}
            />
            <View>
                <TextInput 
                    placeholder='Comment...'
                    onChangeText={(text) => {
                        setText(text);
                    }}
                />
                <Button
                    onPress={() => onCommentSend()}
                    title='Send'
                />
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    users: store.usersState.users
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
