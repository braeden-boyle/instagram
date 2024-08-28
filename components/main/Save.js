import React, { useState } from 'react'
import { View, TextInput, Image, Button } from 'react-native'
import { auth, db, firebaseApp } from '../../firebaseConfig'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'


export default function Save(props) {
    const [caption, setCaption] = useState('')

    const uploadImage = async () => {
        const uri = props.route.params.image;
        
        const response = await fetch(uri);
        const blob = await response.blob();

        const storage = getStorage(firebaseApp);

        const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;
        console.log(childPath);
        const storageRef = ref(storage, childPath);

        const uploadTask = uploadBytesResumable(storageRef, blob)

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error('Uplaod failed', error)
            },
            // Upload completed
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
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
