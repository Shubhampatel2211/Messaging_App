const fcm = require('fcm-node');
let FCM_SERVER_KEY = 'AAAAQb2pM3w:APA91bEyALDZZ-XHMi3hz1ijRnrH0GC7i1UNzQijOpC5n3uw9t_-9Catvuomymn5t4aSCOECYIRQnINEJHjKF8akuJbscjTncoRc-V_nA9xzYY-GNe1D4ufoeO7AQav2QhCZIfOBk8rQ';
let FCM = new fcm(FCM_SERVER_KEY);

class NotificationValidator {

  async notification(id) {
   
    var message = { 
        to: 'eKF9luQnRTS394cM0dd43E:APA91bGOQ6py9Q50W9a_3e2L_ZHLSxds6CwYWFLabNrAfVAUFN155nSqx2LSuD4alBfq8ZxK_UVHaJWf9XPF0X380P-D7uohojBvI6EcG4N_F9sFdMfHQQrY2c-DyTGxc-QLurP1rmaO', 
        
        notification: {
            title: 'Title of your push notification', 
            body: 'Body of your push notification' 
        },
        data: {  
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };
    var notificationInsert = await db.query(`INSERT INTO notification (user_id) values ('${id}')`)

    console.log("========>>",notificationInsert)
    FCM.send(message, function (err, response) {
      if (err) {
        console.log("error found", err);
      } else {
        console.log("response here", response);
      }
    });
  }
}
module.exports = new NotificationValidator()