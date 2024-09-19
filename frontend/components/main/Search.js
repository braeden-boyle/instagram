import React, { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native'

import { db } from '../../../firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'


export default function Search(props) {
    const [users, setUsers] = useState([])

    const fetchUsers = async (search) => {
        const q = query(collection(db, 'users'), where('name', '>=', search));
        const snapshot = await getDocs(q)
        .then((snapshot) => {
            let users = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
            });
            setUsers(users);
        })
    }

    return (
        <View>
            <TextInput 
                placeholder='Type here...' 
                onChangeText={(search) => {fetchUsers(search)}}
            />
            
            <FlatList
                numColumns={1}
                horizontal={false}
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate('Profile', {uid: item.id})
                        }}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
  )
}