var app = angular.module('myApp', []);
var hostname = window.location.host;

app.controller('MainCtrl', function($scope, $http) {
    /********** user **********/
    $scope.user = {};

    /********** contact **********/
    $scope.contactView = true;
    $scope.contactCreateView = false;
    $scope.contacts = [];
    $scope.contact = {};
    $scope.newContact = {};
    $scope.contactError = {};
    $scope.contactError.show = false;

    $scope.setContact = function (c){
        if ($scope.contactView)
            $scope.contact = c;
    };

    $scope.selectedContact = function (c_id) {
        if ($scope.contact.id == c_id)
            return 'selectedContact';
        else
            return '';
    }

    $scope.editContact = function () {
        $scope.contactView=false;
        $scope.newContact=clone($scope.contact);
    }

    $scope.saveContact = function () {
        var group_id = $scope.contactGroup ? $scope.contactGroup.id : null;
        $scope.newContact.group_id = group_id;
        if ($scope.contactCreateView)
            $scope.contactCreate($scope.newContact)
        else {
            $scope.contactUpdate($scope.newContact);
            $scope.contact = clone($scope.newContact);
        }
    };

    $scope.cancelContact = function () {
        $scope.contactError.show = false;
        $scope.contactView=true;
        $scope.contactCreateView = false;
        $scope.newContact = {};
        $scope.findGroupById($scope.contact.group_id);
    };

    $scope.createContact = function () {
        $scope.contactCreateView = true;
        $scope.contactView = false;
        $scope.contactGroup = null;
    };

    /********** group **********/
    $scope.groups = [];
    $scope.group = {};
    $scope.contactGroup = {};
    $scope.newGroup = {};
    $scope.groupError = {};
    $scope.groupError.show = false;

    $scope.createGroup = function () {
        bootbox.prompt('Create new group', function(result) {
          if (result === null) return;
          $scope.groupCreate(result);
        });
    };

    $scope.editGroup = function () {
        if (!$scope.group || !$scope.group.name) return;
        bootbox.prompt('Edit group', function(result) {
          if (result === null) return;
          $scope.groupUpdate($scope.group.id, result);
        }, $scope.group.name);
    };

    $scope.deleteGroup = function () {
        if (!$scope.group || !$scope.group.name) return;
        bootbox.confirm("Do you really want to delete '" + $scope.group.name + "' group?", function(result) {
            if (!result) return;
            $scope.groupDelete($scope.group.id);
            $scope.group = {};
        });
    };

    $scope.setGroup = function (){
        if ($scope.group)
            $scope.groupContacts($scope.group.id);
        else
            $scope.allContacts();
    };

    $scope.findGroupById = function (group_id){
        if (!$scope.contactView) return;
        for (var key in $scope.groups)
            if ($scope.groups[key].id == group_id) {
                $scope.contactGroup = $scope.groups[key];
                return;
            }
        $scope.contactGroup = {};
    };

    $scope.selectedGroup = function () {
        if (!$scope.contactCreateView)
            return contactGroup;
        else
            return null;
    }

    /********** post/get **********/
    $scope.getUser = function() {
        $http({
                url: 'http://' + hostname + '/user/me',
                method: "POST",
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
            $scope.user = data.user;
        });
    };

    $scope.allContacts = function() {
        $http.get('http://' + hostname + '/allContacts')
          .then(function(res) {
            $scope.contacts = res.data;
        });
    };

    $scope.allGroups = function () {
        $http.get('http://' + hostname + '/userGroups')
        .then(function(res) {
            $scope.groups = res.data;
        });
    };

    $scope.contactDelete = function (contact_id) {
        bootbox.confirm("Do you really want to delete this contact?", function(result) {
            if (!result) return;
            $http({
                    url: 'http://' + hostname + '/contactDelete',
                    method: "POST",
                    data: {id: contact_id},
                    headers: {'Content-Type': 'application/json; charset=utf-8'}
            }).success(function (data) {
                $scope.refreshContacts(data);
            });
        });
    };

    $scope.groupDelete = function (group_id) {
        $http({
                url: 'http://' + hostname + '/groupDelete',
                method: "POST",
                data: {id: group_id},
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
                $scope.allGroups();
        });
    };

    $scope.groupCreate = function (name) {
        $http({
                url: 'http://' + hostname + '/groupCreate',
                method: "POST",
                data: {name: name},
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
            $scope.verifyGroupResponse(data);
        });
    };

    $scope.groupUpdate = function (group_id, name) {
        $http({
                url: 'http://' + hostname + '/groupUpdate',
                method: "POST",
                data: {id: group_id, name: name},
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
            $scope.verifyGroupResponse(data);
        });
    };

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

    $scope.contactCreate = function(contact) {
        $http({
                url: 'http://' + hostname + '/contactCreate',
                method: "POST",
                data: contact,
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
            $scope.verifyContactResponse(data);
        });
    };

    $scope.contactUpdate = function(contact) {
        $http({
                url: 'http://' + hostname + '/contactUpdate',
                method: "POST",
                data: contact,
                headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function (data) {
            $scope.verifyContactResponse(data);
        });
    };

    /********** post/get tools **********/
    $scope.verifyGroupResponse = function (data) {
        if (data.success == false) {
            $scope.groupError.msg = data.message;
            $scope.groupError.show = true;
        }
        else {
            $scope.allGroups();
            $scope.groupError.show = false;
        }
    };

    $scope.verifyContactResponse = function (data) {
        if (data.success == false) {
            $scope.contactError.msg = data.message;
            $scope.contactError.show = true;
        }
        else {
            $scope.refreshContacts(data);
            $scope.contactError.show = false;
            $scope.newContact = {};
            $scope.contactView = true;
            $scope.contactCreateView = false;
        }
    };

    $scope.refreshContacts = function (data) {
        if ($scope.group && $scope.group.id)
            $scope.groupContacts($scope.group.id);
        else
            $scope.allContacts();
    };

    /********** init **********/
    $scope.allContacts();
    $scope.allGroups();
    $scope.getUser();
});

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

/*
$("#contactSetGroup").click(function(event) {
  event.preventDefault();
  var dataObj = {};
  dataObj.ids = [5,7];
  dataObj.group_id = 1;
  sendAjax('http://' + hostname + '/contactSetGroup', 'POST', dataObj, function (res) {
    console.log(res);
  });
});
*/
