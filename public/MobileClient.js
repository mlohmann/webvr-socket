var MobileClient = (function() {
  MobileClient.prototype.animationRequest = null;

  function MobileClient() {
    var _this = this; 
    this.socket = io.connect();
    this.socket.on("connect", function() {
      _this.onConnect(); 
    });
  }

  MobileClient.prototype.broadcastMobileData = function() {
    // this.socket.emit("mobile-send", {
    //    // data here
    // });
  };

  MobileClient.prototype.broadcastConnection = function(sessionID_) {
    this.socket.emit("session-connect", { session: sessionID_ });
  };

  MobileClient.prototype.endAnimation = function() {
    window.cancelAnimationFrame(this.animationRequest);
  };

  MobileClient.prototype.onConnect = function() {
    var sessionID,
        _this = this;
 

    this.socket.on("connection-established", function(data) {
      _this.onConnectionEstablished(data);
    });

    this.socket.on("desktop-receive", function(data) { 
      console.log("data.direction",data.direction)
      $("#debug").html("direction " + data.direction);
      _this.direction = data.direction;
    });

    sessionID = window.location.search.replace("?sessionID=", '');
    if (isNaN(sessionID) === false && sessionID.length === 4) {
      this.broadcastConnection(sessionID);
    }
  };

  MobileClient.prototype.onDesktopReceive = function(data) {
    console.log('onDesktopReceive ',data);
  };

  MobileClient.prototype.onConnectionEstablished = function() {
    console.log('onConnectionEstablished');
    $("#debug").html("begin rotating phone");
    this.onAnimationFrame();
  };

  MobileClient.prototype.onAnimationFrame = function() {
    var _this = this;

    this.animationRequest = window.requestAnimationFrame(function(){
      _this.onAnimationFrame();
    });

    this.broadcastMobileData();
  };

  return MobileClient;

})();
