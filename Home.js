import React, { Component } from 'react';
import socketIO from "socket.io-client"
import { StyleSheet, Button,Text, TouchableOpacity, View,Alert } from 'react-native'
import { auth } from './firebase'
///////////////////  global variables //////////////////////////////////////////////
var aesjs = require('aes-js');
var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
var converter = require('hex2dec');
// The counter is optional, and if omitted will begin at 1
var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));

// encrypt 0  
var textBytes = aesjs.utils.utf8.toBytes(0);
var encryptedBytes = aesCtr.encrypt(textBytes);
var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
const s = converter.hexToDec(encryptedHex);

// encrypt 1
textBytes = aesjs.utils.utf8.toBytes(1);
encryptedBytes = aesCtr.encrypt(textBytes);
encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
const a = converter.hexToDec(encryptedHex);
    
var r_local_copy={};
var balance=0;
var balance_dash=0;
var users = {};
var n = 0;
var round = 0;
////////////////////////////////////////////////////////////////


// const socket = socketIO('http://localhost:8000', {      
//   transports: ['websocket'], jsonp: false });   
//   //socket.connect(); 
//   socket.on('connect', () => { 
//     console.log('connected to socket server'); 
//   });


export default class App extends Component {
  constructor(props) {
    super(props);
    this.socket = socketIO('http://localhost:8000', {      
  transports: ['websocket'], jsonp: false });   
  //socket.connect(); 
  this.socket.on('connect', () => { 
    console.log('connected to socket server'); 
  });

    this.state = {
      connected: this.socket.connected,
      currentTransport: this.socket.connected ? this.socket.io.engine.transport.name : '-',
      lastMessage: ""
    };
  }

  componentDidMount() {

    this.socket.connect();
    this.socket.on('connect', () => this.onConnectionStateUpdate());
    this.socket.on('disconnect', () => this.onConnectionStateUpdate());
    this.socket.on('message', (content) => this.onMessage(content));
    ///////////////////////////////////////////////////////////
    this.socket.on("users", (content) => {
      users = content;
      console.log(users);
      let stuff = s + a;
      this.socket.emit("stuff",stuff);
      n = Object.keys(users).length;
    });
    /////////////////////////////////////////////////////////
    ///////////////////////// transfer values //////////////////////
    this.socket.on("transfer values", (content) => {
      console.log("entered");
      round = content[0];
      console.log(round);
      let d = new Array(n); for (let i=0; i<n; ++i) d[i] = 0;
      for (let i=0; i<n; ++i){
        let plaintext= (round*100)+(users[this.socket.id]*10)+i;
        // aes
        textBytes = aesjs.utils.utf8.toBytes(plaintext);
        encryptedBytes = aesCtr.encrypt(textBytes);
        encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        d[i] = converter.hexToDec(encryptedHex);

      }
      
      let v = new Array(n); for (let i=0; i<n; ++i) v[i] = d[i];
      let to = content[1];
      if (to!="dummy"){v[users[to]]=s+v[users[to]];}
      else { v[users[this.socket.id]] = s + v[users[this.socket.id]]; }
      //let mask = s + a;
      console.log(a);
      var send_data = { 0: v, 1: round, 2: a };
      this.socket.emit("transfer values",send_data);
      console.log("transferred");

    /////// save local copy
      r_local_copy[round]=[];
      console.log(round);
      for (let i = 0; i < n; i++){
        let k = [];
        for (let j = 0; j < n; j++){
        let plaintext= (round*100)+(i*10)+j;
          console.log(plaintext);
        // aes
        textBytes = aesjs.utils.utf8.toBytes(plaintext);
        encryptedBytes = aesCtr.encrypt(textBytes);
        encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
          let test = converter.hexToDec(encryptedHex);
          console.log(test);
        k.push(test);
      } 
      r_local_copy[round].push(k);
      }
    });
    ///////////////////////////////////////////////////////////////
    ////////////////////////// balance update ///////////////////
    this.socket.on("balance update", ({ v_dash, c, b }) => {
      //check integrity
      console.log(`${balance} :balance`);
      console.log(r_local_copy);
      //balance update
      let cc=0;
      for (let i = 0; i < n; i++) {
        let r = r_local_copy[round][i];
        console.log(r);
        cc += (r[i] + a) * (2 ** i);
      }
      for (let i = 0; i < n; i++){
        if ((-((2 ** i) * s) - cc) == c) {
          console.log("check 1");
          let j = 0;
          for (let k = 0; k < n ; k++) j+=r_local_copy[k][users[this.socket.id]]
          for (let k=0; k< 3; k++){
            if (b == (balance + ((k - 1) * s) + j - a)) {
              console.log("check 2");
                balance=b;
                balance_dash=balance_dash+(k-1);
            }}}}
      console.log(`${balance} :balance`);
    });
    
    /////////////////////////////////////////////////////////////

  }

  componentWillUnmount() {
    this.socket.off('connect');
    this.socket.off('disconnect');
    this.socket.off('message');
  }

  onConnectionStateUpdate() {
    this.setState({
      connected: this.socket.connected,
      currentTransport: this.socket.connected ? this.socket.io.engine.transport.name : '-'
    });
    if (this.socket.connected) {
      this.socket.io.engine.on('upgrade', () => this.onUpgrade());
    } else {
      this.socket.io.engine.off('upgrade');
    }
  }

  onMessage(content) {
    this.setState({
      lastMessage: content
    });
  }

  onUpgrade() {
    this.setState({
      currentTransport: this.socket.io.engine.transport.name
    });
  }
  clicked = () => {
    console.log("clicked");
    console.log(this.socket.id)
    for (let id in users) {
      if (id != this.socket.id) {
        var content = id;
        console.log(`${id} :to`);
        break;
      }
    }
		this.socket.emit('request', content);
	}
  
  handleSignOut = () => {
    const { navigation } = this.props;
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }
  render() {
    
    return (
      <View style={styles.container}>
        <Text>Email: {auth.currentUser?.email}</Text>
          <TouchableOpacity
          onPress={() => { this.handleSignOut(); }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>

        <Text>State: { this.state.connected ? 'Connected' : 'Disconnected' }</Text>
        <Text>Current transport: { this.state.currentTransport }</Text>
        <Text>Last message: { this.state.lastMessage }</Text>
        <Button
        title="Press me"
          onPress={() => { this.clicked(); }}
      />
      </View>
    );
  }
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
