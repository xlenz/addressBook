var hostname = window.location.host;

$(document).ready(function () {
    sendAjax('http://' + hostname + window.location.pathname, function (data) {
        var list = $('#userProperties');
        if (!data.success)
            list.text(data.message);
        else {
            var row = '<div class="row"><div class="col-xs-5">{key}</div><div class="col-xs-1">{value}</div></div>';
            for (var f in data.user) {
                list.append(row.format({
                    key: f,
                    value: data.user[f]
                }))
            }
        }
    });
})

function sendAjax(url, callback) {
    setTimeout(function () {
        $.ajax({
            type: 'POST',
            url: url,
            contentType: 'application/json; charset=utf-8',
            //async: true,
            success: function (data) {
                callback(data);
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