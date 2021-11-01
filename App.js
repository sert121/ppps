import React, { Component } from 'react';
import { StyleSheet,Button, Text,Alert, View } from 'react-native';
import socketIO from "socket.io-client"
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
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


const socket = socketIO('http://localhost:8000', {      
  transports: ['websocket'], jsonp: false });   
  socket.connect(); 
  socket.on('connect', () => { 
    console.log('connected to socket server'); 
  });

  
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: socket.connected,
      currentTransport: socket.connected ? socket.io.engine.transport.name : '-',
      lastMessage: ""
    };
  }

  componentDidMount() {
    socket.on('connect', () => this.onConnectionStateUpdate());
    socket.on('disconnect', () => this.onConnectionStateUpdate());
    socket.on('message', (content) => this.onMessage(content));
    ///////////////////////////////////////////////////////////
    socket.on("users", (content) => {
      users = content;
      console.log(users);
      let stuff = s + a;
      socket.emit("stuff",stuff);
      n = Object.keys(users).length;
    });
    /////////////////////////////////////////////////////////
    ///////////////////////// transfer values //////////////////////
    socket.on("transfer values", (content) => {
      console.log("entered");
      round = content[0];
      console.log(round);
      let d = new Array(n); for (let i=0; i<n; ++i) d[i] = 0;
      for (let i=0; i<n; ++i){
        let plaintext= (round*100)+(users[socket.id]*10)+i;
        // aes
        textBytes = aesjs.utils.utf8.toBytes(plaintext);
        encryptedBytes = aesCtr.encrypt(textBytes);
        encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        d[i] = converter.hexToDec(encryptedHex);

      }
      
      let v = new Array(n); for (let i=0; i<n; ++i) v[i] = d[i];
      let to = content[1];
      if (to!="dummy"){v[users[to]]=s+v[users[to]];}
      else { v[users[socket.id]] = s + v[users[socket.id]]; }
      //let mask = s + a;
      console.log(a);
      var send_data = { 0: v, 1: round, 2: a };
      socket.emit("transfer values",send_data);
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
    socket.on("balance update", ({ v_dash, c, b }) => {
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
          for (let k = 0; k < n ; k++) j+=r_local_copy[k][users[socket.id]]
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
    socket.off('connect');
    socket.off('disconnect');
    socket.off('message');
  }

  onConnectionStateUpdate() {
    this.setState({
      connected: socket.connected,
      currentTransport: socket.connected ? socket.io.engine.transport.name : '-'
    });
    if (socket.connected) {
      socket.io.engine.on('upgrade', () => this.onUpgrade());
    } else {
      socket.io.engine.off('upgrade');
    }
  }

  onMessage(content) {
    this.setState({
      lastMessage: content
    });
  }

  onUpgrade() {
    this.setState({
      currentTransport: socket.io.engine.transport.name
    });
  }
  clicked = () => {
    console.log("clicked");
    console.log(socket.id)
    for (let id in users) {
      if (id != socket.id) {
        var content = id;
        console.log(`${id} :to`);
        break;
      }
    }
		socket.emit('request', content);
	}
  
  
  render() {
    return (
      <View style={styles.container}>
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
  },
});
