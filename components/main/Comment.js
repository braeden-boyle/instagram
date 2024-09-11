import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Button, TextInput } from 'react-native'
import { db } from '../../firebaseConfig'
import { collection, doc, getDocs } from 'firebase/firestore'

export default function Comment(props) {
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {
        if (props.route.params.postId !== postId) {
            const q = collection(db, `posts/${props.route.params.uid}/userPosts/${props.route.params.postId}/comments`);
            getDocs(q).then((snapshot) => {
                let comments = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const id = doc.id
                    return {id, ...data}
                });
                setComments(comments);
            });
            setPostId(props.route.params.postId);
        }
    }, [props.route.params.postId])
    return (
        <View>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({item}) => (
                    <View>
                        <Text>{item.text}</Text>
                    </View>
                )}
            />
        </View>
    )
}
