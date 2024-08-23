import { Camera, CameraType } from 'expo-camera/legacy';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function App() {
  const [type, setType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const takePicture = async () => {
    if (camera){
      const data = await camera.takePictureAsync(null);
      setImage(data.uri)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Camera
          ref={ref => setCamera(ref)} 
          style={styles.camera} 
          type={type}
        />
      </View>
      <Button style={styles.button} onPress={toggleCameraType} title='Flip Camera'/>
      <Button title='Take Picture' onPress={() => takePicture()}/>
      {image &&  <Image source={{uri: image}} style={{flex: 1}}/>} 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  camera: {
    flex: 1
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
