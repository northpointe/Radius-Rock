(function() {
  const config = require("./config");

  var dgram, http, https, radius, server, session_cache, verify_remote;

  radius = require("radius");
  dgram = require("dgram");
  https = require("https");
  http = require("http");
  server = dgram.createSocket("udp4");

  verify_remote = function(user, pass, cb) {
    if(pass == ""){ // Skip if password blank
      return cb(false);
    }
    var options, post_data, req;
    post_data = JSON.stringify({
      'Username': user,
      'Password': pass
    });
    options = {
      hostname: config.rock_hostname,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': post_data.length
      }
    };
    req = https.request(options, function(res) {
      var data;
      if (res.statusCode !== 204) {
        console.log("Error:" + res.statusCode + " / " + res.body);
        return cb(false);
      }
      data = "";
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        return data += chunk;
      });
      return res.on('end', function() {
        try {
          return cb(true);
        } catch (error) {
          console.error(error);
          return cb(false);
        }
      });
    });
    req.on('error', function(e) {
      console.error("problem with request: " + e.message);
      return cb(false);
    });
    req.write(post_data);
    return req.end();
  };

  session_cache = {};

  server.on("message", function(msg, rinfo) {
    var packet, password, send_response, username;
    try {
        packet = radius.decode({packet: msg, secret: config.radius_secret});
      } catch (e) {
        console.log("Malformed RADIUS Packet. Dropping silently.")
      }

    username = packet.attributes['User-Name'];
    password = packet.attributes['User-Password'];

    console.log("Recv " + packet.code + " for " + username);
    if (packet.code !== 'Access-Request') {
      console.log('unknown packet type: ', packet.code);
      return;
    }
    send_response = function(code, attr) {
      var response;
      console.log("Send " + code + " for user " + username);
      response = radius.encode_response({
        packet: packet,
        code: code,
        secret: config.radius_secret,
        attributes: attr || []
      });
      return server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
        if (err) {
          return console.log('Error sending response to ', rinfo);
        }
      });
    };
    return verify_remote(username, password, function(ok) {
      var code;
      code = "Access-Reject";
      if (ok) {
        code = "Access-Accept";
      }
      return send_response(code);
    });
  });

  server.on("listening", function() {
    var address;
    address = server.address();
    return console.log("RadiusRock listening " + address.address + ":" + address.port);
  });

  server.bind(1812);

}).call(this);
