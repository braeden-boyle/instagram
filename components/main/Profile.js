import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { connect } from 'react-redux';
import { doc, getDoc, query, collection, getDocs, orderBy, setDoc, deleteDoc } from 'firebase/firestore';

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts } = props;

    if (props.route.params.uid == auth.currentUser.uid) {
      setUser(currentUser);
      setUserPosts(posts);
    } else {
        try {
          const docRef = doc(db, "users", props.route.params.uid)
          getDoc(docRef).then((snapshot) => {
            if (snapshot.exists()) {
              setUser(snapshot.data());
            } else {
              console.log('No such document.');
            }
          });
        } catch (error) {
            console.error('Error fetching user: ', error);
        }

        try {
          const q = query(collection(db, `posts/${props.route.params.uid}/userPosts`), orderBy('createdAt', 'desc'));
          getDocs(q).then((snapshot) => {
            if (!snapshot.empty) {
              let posts = snapshot.docs.map(doc => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data }
              });
              setUserPosts(posts);
            }
          })
        } catch (error) {
            console.error('Error fetching posts: ', error);
        }
    }

    if (props.following.indexOf(props.route.params.uid) > -1 ) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]);

  const onFollow = async () => {
    await setDoc(doc(db, `following/${auth.currentUser.uid}/userFollowing/${props.route.params.uid}`), {}); 
  }

  const onUnfollow = async () => {
    await deleteDoc(doc(db, `following/${auth.currentUser.uid}/userFollowing/${props.route.params.uid}`)); 
  }

  if (user == null) {
    return <View/>
  }
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid != auth.currentUser.uid ? (
          <View>
            {following ? (
              <Button
                title='Following'
                color={'#c7c7c7'}
                onPress={() => onUnfollow()}
              />
            ) : 
            (
              <Button
                title='Follow'
                onPress={() => onFollow()}
              />
            )}
          </View>
        ) : null }
      </View>

      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({item}) => (
            <View
              style={styles.containerImage}>
              <Image
                style={styles.image}
                source={{uri: item.downloadURL}}
              />
            </View>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20
  },
  containerGallery: {
    flex: 1
  },
  image: {
    flex: 1,
    aspectRatio: 1/1
  },
  containerImage: {
    flex: 1/3
  }
})

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following
})

export default connect(mapStateToProps, null)(Profile);
