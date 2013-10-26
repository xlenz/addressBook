var app = angular.module('myApp', []);
var hostname = window.location.host;

$(document).ready(function () {
    $('input').attr('maxlength', 45);
});

app.controller('MainCtrl', function ($scope, $http) {
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

    $scope.setContact = function (c) {
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
        $scope.contactView = false;
        $scope.newContact = angular.copy($scope.contact);
    }

    $scope.saveContact = function () {
        var group_id = $scope.contactGroup ? $scope.contactGroup.id : null;
        $scope.newContact.group_id = group_id;
        if ($scope.contactCreateView)
            $scope.contactCreate($scope.newContact)
        else {
            $scope.contactUpdate($scope.newContact);
            $scope.contact = angular.copy($scope.newContact);
        }
    };

    $scope.cancelContact = function () {
        $scope.contactError.show = false;
        $scope.contactView = true;
        $scope.contactCreateView = false;
        $scope.newContact = {};
        $scope.findGroupById($scope.contact.group_id);
    };

    $scope.createContact = function () {
        $scope.contactCreateView = true;
        $scope.contactView = false;
        $scope.contactGroup = null;
    };

    $scope.findContactById = function (id) {
        for (var key in $scope.contacts) {
            if ($scope.contacts[key].id == id) {
                $scope.contact =  $scope.contacts[key];
                return;
            }
        }
    };

    /********** group **********/
    $scope.groups = [];
    $scope.group = {};
    $scope.contactGroup = {};
    $scope.newGroup = {};
    $scope.groupError = {};
    $scope.groupError.show = false;

    $scope.createGroup = function () {
        bootbox.prompt({
            title: 'Create new group',
            callback: function (result) {
                if (result === null) return;
                $scope.groupCreate(result);
            },
            placeholder: 'Group Name'
        });
    };

    $scope.editGroup = function () {
        if (!$scope.group || !$scope.group.name) return;
        bootbox.prompt({
            title: 'Edit group',
            callback: function (result) {
                if (result === null) return;
                $scope.groupUpdate($scope.group.id, result);
            },
            value: $scope.group.name
        });
    };

    $scope.deleteGroup = function () {
        if (!$scope.group || !$scope.group.name) return;
        bootbox.confirm("Do you really want to delete '" + $scope.group.name + "' group?", function (result) {
            if (!result) return;
            $scope.groupDelete($scope.group.id);
            $scope.group = {};
            $scope.allContacts();
        });
    };

    $scope.setGroup = function () {
        if ($scope.group)
            $scope.groupContacts($scope.group.id);
        else
            $scope.allContacts();
    };

    $scope.findGroupById = function (group_id) {
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
    $scope.getUser = function () {
        $http({
            url: 'http://' + hostname + '/user/me',
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.user = data.user;
        });
    };

    $scope.allContacts = function (contact_id) {
        $http.get('http://' + hostname + '/allContacts')
            .then(function (res) {
                $scope.contacts = res.data;
                if (contact_id) $scope.findContactById(contact_id);
            });
    };

    $scope.allGroups = function () {
        $http.get('http://' + hostname + '/userGroups')
            .then(function (res) {
                $scope.groups = res.data;
            });
    };

    $scope.contactDelete = function (contact_id) {
        bootbox.confirm("Do you really want to delete this contact?", function (result) {
            if (!result) return;
            $http({
                url: 'http://' + hostname + '/contactDelete',
                method: "POST",
                data: {
                    id: contact_id
                },
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).success(function (data) {
                $scope.contact = {};
                $scope.refreshContacts();
            });
        });
    };

    $scope.groupDelete = function (group_id) {
        $http({
            url: 'http://' + hostname + '/groupDelete',
            method: "POST",
            data: {
                id: group_id
            },
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.allGroups();
        });
    };

    $scope.groupCreate = function (name) {
        $http({
            url: 'http://' + hostname + '/groupCreate',
            method: "POST",
            data: {
                name: name
            },
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.verifyGroupResponse(data);
        });
    };

    $scope.groupUpdate = function (group_id, name) {
        $http({
            url: 'http://' + hostname + '/groupUpdate',
            method: "POST",
            data: {
                id: group_id,
                name: name
            },
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.verifyGroupResponse(data);
        });
    };

    $scope.groupContacts = function (group_id, contact_id) {
        $http({
            url: 'http://' + hostname + '/groupContacts',
            method: "POST",
            data: {
                group_id: group_id
            },
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.contacts = data;
            if (contact_id) $scope.findContactById(contact_id);
        });
    };

    $scope.contactCreate = function (contact) {
        $http({
            url: 'http://' + hostname + '/contactCreate',
            method: "POST",
            data: contact,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            $scope.verifyContactResponse(data);
        });
    };

    $scope.contactUpdate = function (contact) {
        $http({
            url: 'http://' + hostname + '/contactUpdate',
            method: "POST",
            data: contact,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).success(function (data) {
            if (!data) {
                data = {};
                data.success = false;
                data.message = 'Unable to modify contact. Probably it was deleted.';
                $scope.contact = {};
                $scope.refreshContacts();
            }
            $scope.verifyContactResponse(data);
        });
    };

    /********** post/get tools **********/
    $scope.verifyGroupResponse = function (data) {
        if (data.success == false) {
            $scope.groupError.msg = data.message;
            $scope.groupError.show = true;
        } else {
            $scope.allGroups();
            $scope.groupError.show = false;
        }
    };

    $scope.verifyContactResponse = function (data) {
        if (data.success == false) {
            $scope.contactError.msg = data.message;
            $scope.contactError.show = true;
        } else {
            $scope.refreshContacts(data);
            $scope.contactError.show = false;
            $scope.newContact = {};
            $scope.contactView = true;
            $scope.contactCreateView = false;
        }
    };

    $scope.refreshContacts = function (data) {
        if (!data || !data.insertId) var id = null;
        else id = data.insertId;
        if ($scope.group && $scope.group.id)
            $scope.groupContacts($scope.group.id, id);
        else
            $scope.allContacts(id);
    };

    /********** init **********/
    $scope.allContacts();
    $scope.allGroups();
    $scope.getUser();
});
