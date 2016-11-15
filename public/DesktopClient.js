var DesktopClient = (function() {

  function DesktopClient(threeJS) {
    var _this = this;

    this.socket = io.connect();
    this.socket.on("connect", function() { 
      _this.onConnect();
    });

    $("body").keydown(function(e) {
      var dir = "";

      switch(e.keyCode){
        case 38:
          dir = "up";
          break;
        case 40: 
          dir = "down";
          break;
        case 37:
          dir = "left";
          break;
        case 39:
          dir = "right";
          break;
      }

      if (dir != ""){ 
        _this.socket.emit("desktop-send", { direction: dir });
      } 
    });
  } 

  DesktopClient.prototype.onConnect = function() {
    var _this = this;

    this.socket.emit("create-session");

    this.socket.on("initial-state", function(data) {
      _this.onInitState(data);
    });

    this.socket.on("connection-established", function(data) {
      _this.onConnectionEstablished(data);
    });

    this.socket.on("mobile-receive", function(data) {
      _this.onMobileReceive(data);
    }); 
  };

  DesktopClient.prototype.onInitState = function(data) {
    console.log('onInitState', data);
    $("#session-id").append("Scan QR Code or type this code into your phone:  " + data.session);
    $('#qrcode').qrcode("http://" + window.document.location.host + "/webVR.html?sessionID=" + data.session);
  };

  DesktopClient.prototype.onConnectionEstablished = function() {
    console.log('onConnectionEstablished');
    $('#qrcode').hide();
    $("#session-id").html("CONNECTED");
  };

  DesktopClient.prototype.onMobileReceive = function(data) {
     console.log('onMobileReceive', data);
  };

  return DesktopClient;
})();
