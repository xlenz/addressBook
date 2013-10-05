var hostname = window.location.host;

$("#login").click(function(event) {
  event.preventDefault();
  var fd = new FormData();
  fd.append( 'username', $('#username').val());
  fd.append( 'password', $('#password').val());
  submitBtn($(this), 'http://' + hostname + '/login', fd);
});

$("#signup").click(function(event) {
  event.preventDefault();
  var pwd = $('#password').val();
  if (pwd != $('#passwordRe').val()) {
    $('#errors').show().find('label').text('Passwords do not match');
    return;
  }
  var fd = new FormData();
  fd.append( 'username', $('#username').val());
  fd.append( 'password', pwd);
  submitBtn($(this), 'http://' + hostname + '/signup', fd);
});

function sendAjax (btn, url, fd, callback) {
  setTimeout(function () {
    $.ajax({
      url: url,
      data: fd,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(data){
        callback(data);
      }
    });
    if (btn) btn.prop("disabled",false);
  }, 10);
}

function submitBtn (btn, url, fd) {
  btn.prop("disabled",true);
  sendAjax(btn, url, fd, function (data){
    err = $('#errors');
    if (data.success) {
      err.hide();
      if (btn.attr('id') == 'signup'){
        sendAjax (null, 'http://' + hostname + '/login', fd, function(data) {window.location = '/'})
      }
      else window.location = '/';
    }
    else {
      err.find('label').html(data.message);
      err.show();
    }
  });
}
