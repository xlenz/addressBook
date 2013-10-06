var hostname = window.location.host;

$(document).ready(function () {
    sendAjax('http://' + hostname + window.location.pathname, 'POST', {}, function (res) {
        var list = $('#userProperties');
        if (!res.success)
            list.text(res.message);
        else {
            var row = '<div class="row"><div class="col-xs-5">{key}</div><div class="col-xs-1">{value}</div></div>';
            for (var f in res.user) {
                list.append(row.format({
                    key: f,
                    value: res.user[f]
                }))
            }
        }
    });
});

$("#allContacts").click(function(event) {
  event.preventDefault();
  sendAjax('http://' + hostname + '/allContacts', 'GET', {}, function (res) {
    console.log(res);
  });
});

$("#groupContacts").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.group_id = 1;
  sendAjax('http://' + hostname + '/groupContacts', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#userGroups").click(function(event) {
  event.preventDefault();
  sendAjax('http://' + hostname + '/userGroups', 'GET', {}, function (res) {
    console.log(res);
  });
});

$("#contactDelete").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.id = 1;
  sendAjax('http://' + hostname + '/contactDelete', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#groupDelete").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.id = 5;
  sendAjax('http://' + hostname + '/groupDelete', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#groupCreate").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.name = 'new group !';
  sendAjax('http://' + hostname + '/groupCreate', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#groupUpdate").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.id = 1;
  dataObj.name = 'updated group !';
  sendAjax('http://' + hostname + '/groupUpdate', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#contactCreate").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.group_id = null;
  dataObj.email = 'test_js@ukr.com';
  dataObj.phone = '+313456736334';
  dataObj.firstName = 'don';
  dataObj.lastName = 'huan';
  sendAjax('http://' + hostname + '/contactCreate', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#contactUpdate").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.id = 4;
  dataObj.group_id = 1;
  dataObj.email = 'update contact';
  dataObj.phone = '+313456736334';
  dataObj.firstName = 'don';
  dataObj.lastName = 'huan';
  sendAjax('http://' + hostname + '/contactUpdate', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

$("#contactSetGroup").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.ids = [5,7];
  dataObj.group_id = 1;
  sendAjax('http://' + hostname + '/contactSetGroup', 'POST', dataObj, function (res) {
    console.log(res);
  });
});

function sendAjax(url, type, dataObj, callback) {
    setTimeout(function () {
        $.ajax({
            type: type,
            url: url,
            contentType: 'application/json; charset=utf-8',
            //async: true,
            data: JSON.stringify(dataObj),
            success: function (res) {
                callback(res);
            }
        })
    }, 10);
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    }
}
