import React, { Component , useState, useEffect }  from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import socketIO from "socket.io-client"
import { useNavigation } from '@react-navigation/native'
import { auth } from 'firebase'


const Test = props =>  {
  
const navigation = useNavigation()
const [isConnected, setIsConnected] = useState('');
const [currentTransport, setCurrentTransport] = useState('');
const [lastMessage, setLastMessage] = useState('');
const [constructorHasRun, setConstructorHasRun] = useState(false);

const constructor = () => {
   if (constructorHasRun) return;
   // Some code...
   setIsConnected(socket.connected);
   setCurrentTransport(socket.connected ? socket.io.engine.transport.name : '-')
   setConstructorHasRun(true);
 };

const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }

const socket = socketIO('http://localhost:8000', {      
  transports: ['websocket'], jsonp: false });   
  socket.connect(); 
  socket.on('connect', () => { 
    console.log('connected to socket server'); 
  });



// const [onUpgrade, setOnUpgrade] = useState(currentTransport);
const handleUpdate = () => {
  setIsConnected(socket.connected);
  setCurrentTransport(socket.connected ? socket.io.engine.transport.name : '-');
  if (socket.connected) {
    socket.io.engine.on('upgrade', () => setCurrentTransport(socket.io.engine.transport.name));
  } else {
    socket.io.engine.off('upgrade');
  }

}
useEffect(() => {
    socket.on('connect', () => {
      handleUpdate();
    })

    socket.on('disconnect', () => {
      handleUpdate();
    })

    socket.on('message',(content) => {
      setLastMessage(content)
    })
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
    }
})


    return (
      <View style={styles.container}>
          <Text>Email: {auth.currentUser?.email}</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>


        <Text>State: { isConnected ? 'Connected' : 'Disconnected' }</Text>
        <Text>Current transport: { currentTransport }</Text>
        <Text>Last message: { lastMessage }</Text>
      </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },   button: {
    backgroundColor: '#0782F9',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default Test
