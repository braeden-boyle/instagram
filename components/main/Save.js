import React, { useState } from 'react'
import { View, TextInput, Image, Button } from 'react-native'
import { auth, db, firebaseApp } from '../../firebaseConfig'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore'


export default function Save(props, { navigation }) {
    const [caption, setCaption] = useState('')

    const savePostData = async (downloadURL) => {
        const docRef = await addDoc(collection(db, `posts/${auth.currentUser.uid}/userPosts`), {
            downloadURL: downloadURL,
            caption: caption,
            createdAt: serverTimestamp()
        }).then(() => {
            props.navigation.popToTop();
        });
    }

    const uploadImage = async () => {
        const uri = props.route.params.image;
        
        const response = await fetch(uri);
        const blob = await response.blob();

        const storage = getStorage(firebaseApp);

        const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;
        const storageRef = ref(storage, childPath);

        const uploadTask = uploadBytesResumable(storageRef, blob)

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error('Upload failed', error)
            },
            // Upload completed
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    savePostData(downloadURL);
                    console.log('File available at ', downloadURL )
                });
            }
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Image source={{ uri: props.route.params.image }}/>
            <TextInput
                placeholder='Write a caption...'
                onChangeText={(caption) => setCaption(caption)}
            />
            <Button title='Save' onPress={() => uploadImage()}/>
        </View>
    )
}
