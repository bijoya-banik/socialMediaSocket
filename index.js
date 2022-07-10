import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
import { Server } from "socket.io";

const io = new Server(server);

import Redis from "ioredis";

const sub = new Redis();
const pub = new Redis();
    
  sub.subscribe("new_notification", (err, count) => {
        if (err) console.error(err.message);
    });
    sub.subscribe("online", (err, count) => {
      if (err) console.error(err.message);
  });
    
    // online offline connect and disconnect, save user id in callaback
    let userId;
    io.on('connection', (socket) => {
      socket.on("con", async (data) => {
        userId = data.id
        if(userId){
            console.log('connecting... user', userId)
            let obj = {
              is_online : 'online',
              id: userId,
  
            }
            io.emit(`online`, obj)
            await pub.publish('online', JSON.stringify({ data: obj}))
            // await Redis.publish('online', JSON.stringify({ data: obj,user_id:userId }))
  
         }
      })
      socket.on("disconnect", async() => {
        //  console.log('disconncting...', userId)
         if(userId){
          // console.log('disconncting... user', userId)
          let obj = {
            is_online : 'offline',
            id: userId,
  
          }
          // await Redis.publish('online', JSON.stringify({ data: obj,user_id:userId}))
          io.emit(`online`, obj)
          await pub.publish('online', JSON.stringify({ data: obj}))
          // await User.query().where('id', userId).update({is_online: 'offline'})
         }
      });

      socket.on("video-call", async (data) => {
        // console.log('on video-call', data)
        io.emit(`video-call:${data.user_id}`, data)
        // await Redis.publish('new_video_call', JSON.stringify({ data: data,user_id:data.user_id }))
      });
      socket.on("audio-call", async (data) => {
          // console.log('on audio-call', data)
          io.emit(`audio-call:${data.user_id}`, data)
          // await Redis.publish('new_audio_call', JSON.stringify({ data: data,user_id:data.user_id }))

      });
      socket.on("notification", async (data) => {
        // console.log('on notification', data)
        io.emit(`noti:${data.user_id}`, data)
        // io.emit(`typing_${data.user_id}`, data)

        // await Redis.publish('new_notification', JSON.stringify({ data: data,user_id:data.user_id }))
      });

      // new functions from internet

      socket.on('connectUser', userData => {
        const index = users.findIndex((e) => e.username === userData.username);
        if (index == -1) {
            users.push(userData);
            socket.userName = userData.username;
            socket.join(userData.username);
            console.log(userData.username + " user registered the name room");
            socket.emit('user-registered', userData);
            io.emit('users', users);
        } else {
            socket.emit("username-already-exist", userData);
        }
    });

    socket.on('call-user', data => {
        console.log("Call User --> from:" + data.from.username + "   to:" + data.to.username);
        /// SDP
        /// TO
        /// FROM
        io.to(data.to.username).emit('call-made', data);
    });

    socket.on('make-answer', data => {
        console.log("Make Answer --> from:" + data.from.username + "   to:" + data.to.username);
        /// SDP
        /// TO
        /// FROM
        io.to(data.to.username).emit('answer-made', data);
    });

    socket.on('ice-candidate', data => {
        console.log("Ice Candidate --> from:" + data.from.username + "   to:" + data.to.username);
        /// CANDIDATE
        /// SDPMID
        /// SDPMLINEINDEX
        /// TO
        /// FROM
        io.to(data.to.username).emit('ice-candidate', data);
    });

    socket.on('hangup', data => {
        console.log("Hangup --> from:" + data.from.username + "   to:" + data.to.username);
        /// SDP
        /// TO
        /// FROM
        io.to(data.to.username).emit('hangup', data);
        io.to(data.from.username).emit('hangup', data);
    });

    socket.on('busy', data => {
        console.log("Hangup --> from:" + data.from.username + "   to:" + data.to.username);
        /// SDP
        /// TO
        /// FROM
        io.to(data.to.username).emit('busy', data);
        io.to(data.from.username).emit('busy', data);
    });


    });
    
    




    sub.on("message", (channel, message) => {
    let notiObj = JSON.parse(message)
       if(channel=='new_notification'){
        io.emit(`noti:${notiObj.user_id}`,  notiObj.data)
      }
      else if(channel=='new_video_call'){
          io.emit(`video-call:${notiObj.user_id}`, notiObj)
        // io.emit(`noti:${notiObj.user_id}`,  notiObj.data)
      }
      else if(channel=='new_audio_call'){
          io.emit(`audio-call:${notiObj.user_id}`, notiObj)
          
    }
    else if(channel=='online'){
      // console.log("online is callded",notiObj.data)
      io.emit(`online`, notiObj.data)
    }
    
    
  });





server.listen(3300, () => {
  console.log('listening on *:3300');
});