import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList } from 'react-native';
import { Button } from 'react-native-web';
import { connect } from 'react-redux';
import { db, auth } from '../../../firebaseConfig';

function Feed(props) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (props.usersFollowingLoaded == props.following.length && props.following.length !== 0) {
      props.feed.sort(function(x,y) {
        return x.creation - y.creation;
      });
      setPosts(props.feed);
    }
  }, [props.usersFollowingLoaded, props.feed]);

  const onLikePress = async (userId, postId) => {
    await setDoc(
      doc(db, `posts/${userId}/userPosts/${postId}/likes/${auth.currentUser.uid}`),
      {});
  }

  const onDislikePress = async (userId, postId) => {
    await deleteDoc(doc(db, `posts/${userId}/userPosts/${postId}/likes/${auth.currentUser.uid}`));
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({item}) => (
            <View
              style={styles.containerImage}>
              <Text style={styles.usernameHeader}>{item.user.name}</Text>
              <Image
                style={styles.image}
                source={{uri: item.downloadURL}}
              />
              { item.currentUserLike ? 
                (
                  <Button
                    title='Dislike'
                    onPress={() => onDislikePress(item.user.uid, item.id)}/>
                )
                :
                (
                  <Button
                    title='Like'
                    onPress={() => onLikePress(item.user.uid, item.id)}/>
                )
              }
              <Text
                onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })}
              >
                  View Comments...
              </Text>
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
    flex: 0.9
  },
  usernameHeader: {
    fontWeight: 'bold', 
    height: 50,
    alignContent: 'center',
    paddingLeft: 10
  }
})

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded
})

export default connect(mapStateToProps, null)(Feed);
