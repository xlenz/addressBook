var app = angular.module('myApp', []);

var hostname = window.location.host;
var groupNameTemplate = 'Group: {groupName}<b class="caret"></b>';

$(document).ready(function () {
    sendAjax('http://' + hostname + window.location.pathname, 'POST', null, function (res) {
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

/*
$('#groupsDropdown a').click(function(event) {
    console.log('here');
    event.preventDefault();
    var groupName = $(this).text();
    $('#groupName').html(groupNameTemplate.format({groupName: groupName}));
});
*/
app.controller('MainCtrl', function($scope, $http) {
    $scope.contacts = [];
    $scope.allContacts = function() {
        $http.get('http://' + hostname + '/allContacts')
          .then(function(res) {
            $scope.contacts = res.data;
        });
    };
    $scope.allContacts();

    $scope.groupContacts = function(group_id) {
        $http({
                url: 'http://' + hostname + '/groupContacts',
                method: "POST",
                data: {group_id: group_id},
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
                    $scope.contacts = data;
        });
    };
    $scope.contact = {};
    $scope.setContact = function (c){
        $scope.contact = c;
    };

    $scope.groups = [];
    $http.get('http://' + hostname + '/userGroups')
      .then(function(res) {
        $scope.groups = res.data;
    });
    $scope.group = {};
    $scope.setGroup = function (){
        if ($scope.group)
            $scope.groupContacts($scope.group.id);
        else
            $scope.allContacts();
    };

    $scope.contactGroup = {};
    $scope.findGroupById = function (group_id){
        for (var key in $scope.groups)
            if ($scope.groups[key].id == group_id) {
                $scope.contactGroup = $scope.groups[key];
                return;
            }
        $scope.contactGroup = {};
    };

    $scope.contactDelete = function (contact_id) {
        if (confirm('Do you really want to delete this contact?'))
            $http({
                    url: 'http://' + hostname + '/contactDelete',
                    method: "POST",
                    data: {id: contact_id},
                    headers: {'Content-Type': 'application/json; charset=utf-8'}
            }).success(function (data) {
                    if ($scope.group.id)
                        $scope.groupContacts($scope.group.id);
                    else
                        $scope.allContacts();
            });
    };

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
    var sendObj = {
        type: type,
        url: url,
        contentType: 'application/json; charset=utf-8',
        success: function (res) {
            callback(res);
        }
    };
    if (dataObj != null)
        sendObj.data = JSON.stringify(dataObj);
    $.ajax(sendObj);
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
