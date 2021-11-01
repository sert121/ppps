const io = require('socket.io')();
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
/////////// global variables ///////////
var users = {};
var round = 0;
var user_no = 0;
var a = 0;
var n = 0;
var B = new Array(n); for (let i = 0; i < n; ++i) B[i] = 0;
var transaction = {};
////////////////////////////////////////


io.on('connection', socket => {
  console.log(`connect: ${socket.id}`);
  if (socket.id in users) {}
  else {
    users[socket.id] = user_no;
    user_no++;
    io.emit("users", users);
    console.log(users);
  }
  
  socket.on('disconnect', () => {
    console.log(`disconnect: ${socket.id}`);
  });

  socket.on('request', (id) => {
    // send notification to accept or reject to id
    // if rejected, do not proceed
    round += 1;
    for (u in users) {
      if (u != socket.id) {
        let dummy = "dummy";
        let info = { 0:round, 1:dummy };
        console.log(u);
        io.to(u).emit("transfer values", info);
        console.log("sent1");
      }
      else {
        let info = { 0:round, 1:id };
        console.log(socket.id);
        io.to(socket.id).emit("transfer values", info);
        console.log("sent2");
      }
    }
  });

  //////////////// transfer ///////////////////
  socket.on("transfer values", (c) => {
    console.log(`${socket.id} :recieved`);
    a=c[2];
    console.log(c[2]);
    let round_r = c[1];
    console.log(round_r);
    var content = c[0];
    const incoming_data = {
      content,
      from: socket.id,
    };
    n = Object.keys(users).length;
    // if transaction round
    if (round_r in transaction) {
      transaction[round_r].push(incoming_data);
    }
    else {
      transaction[round_r] = [];
      transaction[round_r].push(incoming_data);
    }
    console.log(transaction[round_r].length);
    if (transaction[round_r].length == n) {
      balance_update(transaction, round_r, n);
    }

  });
    function balance_update(transaction, round_r,n) {
    
      let v = new Array(n); for (let i = 0; i < n; ++i) v[i] = 0;
      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
          v[i] += transaction[round_r][j].content[i];
        }
      }


      let v_dash = 0;
      let c = 0;
      for (let i = 0; i < n; ++i) v_dash += v[i];
      for (let i = 0; i < n; ++i) B[i] = B[i] + v[i] - a;
      for (let i = 0; i < n; ++i) c += ((transaction[round_r][i].content[i] - a) * (2 ** i));
      for (let i = 0; i < n; ++i) {
        let b=B[i];
        let outgoing_data = { v_dash, c, b };
        let dest = getKeyByValue(users, i)
        console.log(dest);
        io.to(dest).emit("balance update", outgoing_data);
        console.log("sent tuple");
      }
    }
  
  /////////////////////////////////////////////
});

io.listen(8000, () => {
  console.log('Started port 8000');
})

setInterval(() => {
  io.emit('message', new Date().toISOString());
}, 1000);
 

