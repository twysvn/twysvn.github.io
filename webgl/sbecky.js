
/**
*  General todo
*  - sb-button
*  - sb-error
*
*/

// TODO: support older ios versions
// TODO: if sb-bind af input/textarea radiobuttons -> hau an onchange listener drauf und update noa di variable

// element storage
var bindings = [{}]
var ajax_bindings = [{}]
var placeholder = [{}]
var forms = [{}]
var errors = [{}]

// listeners
var sbecky_change_listeners = {}

// other
var elements = {}
var prefix = "_sbecky_"
var _internal_vars = 0
sbecky = {}
scope = []

// private config variables
var _sbecky_sould_call_change = true

var _sbecky_ready = []

function _sbecky_get_new_binding() {
    return (prefix + (_internal_vars++))
}

function _sbecky_registerAll(index = 0) {
    for (var i in bindings[index]) {
        if (bindings[index].hasOwnProperty(i)) {
            _sbecky_register(i)
        }
    }
    for (var i in forms[index]) {
        if (forms[index].hasOwnProperty(i)) {
            forms[index][i].addEventListener("submit", function(e) {
                e.preventDefault()
                var type = this.getAttribute("method")
                var url = this.getAttribute("action")
                var data = this.serialize()
                data["sb-form"] = this.getAttribute("sb-form")
                ajax(url, type, data, function(d){
                    console.log(d);
                    // Todo: validate
                }, function(d){
                    console.log(d);
                    // Todo: error, validate
                })
            }, false);
        }
    }
}

function _sbecky_on_change(index, variable){
    return function(value) {
        for (var dom of bindings[index][variable]) {
            if (typeof value == "object") {
                dom.append(value)
            } else {

                var name = dom.tagName.toLowerCase()
                if (name == "input" || name == "textarea" || name == "select"){ // TODO: test
                    dom.value = value
                } else if (dom.getAttribute("sb-ajax") != undefined && dom.getAttribute("items") != undefined) {
                    dom.innerHTML += value
                } else {
                    dom.innerHTML = value
                }
                for (c of dom.children) {
                    _sbecky_search_and_register(c)
                }
            }
        }
    }
}

function _sbecky_register(variable, obj = sbecky, index = 0) {

    // don't rebind
    if (obj[variable] != undefined)
        return

    console.log("sbecky: register " + variable, obj);

    for (var dom of bindings[index][variable]) {
        var name = dom.tagName.toLowerCase()
        if (name == "input" || name == "textarea" || name == "select"){ // TODO: test, select?, checkbox?, radioboxes?, slider
            // dom.oninput = function() {
            //     var bind = this.getAttribute("sb-bind")
            //     sbecky[bind] = this.value
            // }

            dom.onchange = function() {
                var bind = this.getAttribute("sb-bind")
                sbecky[bind] = this.value
            } 
        }

        var on_change = _sbecky_on_change(index, variable)
        var key = "_"+variable
        if (obj[key] == undefined) {
            obj[key] = {}
            Object.defineProperty(obj, variable, {
                get: function(){
                    // console.log("get", variable, this);
                    return this["_"+variable];
                },
                set: function(val){
                    this["_"+variable] = val
                    if(_sbecky_sould_call_change)
                        _sbecky_call_change(variable, val)
                    // console.log("set", variable, this);
                    on_change(val)
                }
            });
        }
    }
}

function _sbecky_search(data, query) {
    return data.querySelectorAll(query)
}

function _sbecky_search_and_register(data) {

    // load placeholder from dom
    var list = _sbecky_search(data, "[sb-placeholder]")
    for (item of list) {
        placeholder[0][item.getAttribute("sb-placeholder")] = item.outerHTML
        item.parentNode.removeChild(item);
    }

    // errors
    list = _sbecky_search(data, "[sb-error]")
    for (item of list) {
        errors[0][item.getAttribute("sb-error")] = item.outerHTML
        item.parentNode.removeChild(item);
    }

    // forms
    list = _sbecky_search(data, "[sb-form]")
    for (item of list) {
        forms[0][item.getAttribute("sb-form")] = item
    }

    // binding
    list = _sbecky_search(data, "[sb-bind]")
    for (item of list) {
        if (bindings[0][item.getAttribute("sb-bind")] == undefined)
            bindings[0][item.getAttribute("sb-bind")] = [item]
        else
            bindings[0][item.getAttribute("sb-bind")].push(item)
    }

    // if sb-bind is missing map internally
    list = _sbecky_search(data, "[sb-ajax]")
    for (item of list) {
        var name = item.getAttribute("sb-bind")
        if (name == undefined) {
            name = _sbecky_get_new_binding()
            item.setAttribute("sb-bind", name)
            bindings[0][name] = [item]
        }
    }

    _sbecky_registerAll();

    // ajax
    for (item of list) {
        var name = item.getAttribute("sb-bind")

        params = getParameters(item)

        // add placeholder
        if (placeholder[0][name] != undefined){
            if (params["items"] != undefined){
                for (var i=0; i < params["items"]; i++) {
                    sbecky[name] = placeholder[0][name]
                }
            }else{
                sbecky[name] = placeholder[0][name]
            }
        }
        // only do on initial item
        if (ajax_bindings[0][name] == undefined) {
            ajax_bindings[0][name] = item
            _sbecky_ajax_wrapper(item, params, data)
        }
    }

}

function _sbecky_ajax_wrapper(it, params, data) {
    var name = it.getAttribute("sb-bind")
    ajax(it.getAttribute("sb-ajax"), "POST", params, function(response) {

        // remove placeholder
        var list = _sbecky_search(data, "[sb-placeholder]")
        for (it of list) {
            it.parentNode.removeChild(it);
        }
        sbecky[name] = response

    }, function(e) {
        console.log("ey", e);
        //TODO error handling

        if (errors[0][name] != null) {
            sbecky[name] = errors[0][name]
        }

    })
}

window.onload = function() {

    _sbecky_search_and_register(document)

    console.log("sbecky is ready.");
    for (fun of _sbecky_ready) {
        fun();
    }
}

//folls mor amol probleme hobm -> var DOMReady = function(a,b,c){b=document,c='addEventListener';b[c]?b[c]('DOMContentLoaded',a):window.attachEvent('onload',a)}
function sbecky_ready(fun) {
    _sbecky_ready.push(fun)
}

function sbecky_change(variable, f) {
    if (sbecky_change_listeners[variable] == undefined){
        sbecky_change_listeners[variable] = [f]
    } else {
        sbecky_change_listeners[variable].push(f)
    }
}

function _sbecky_call_change(variable, param) {
    if (sbecky_change_listeners[variable] != undefined)
        for (var f of sbecky_change_listeners[variable]) {
            f(param)
        }
}

// std ajax request
function ajax(url, type, params={}, success, error) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if(this.status === 200) {
                success(this.responseText)
            }else{
                //TODO error(this.responseText)
                error(this.responseText)
            }
        }
    };
    xhttp.open(type, url, true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
    }).join('&'));
}

// get request
function get(url, success, error = function(){}) {
    ajax(url, "GET", {}, success, error)
}

// post request
function post(url, success, error = function(){}) {
    ajax(url, "POST", {}, success, error)
}

// converts html attributes to parameter dict
function getParameters(obj) {
    var attrs = [...obj.attributes].map(attr => attr.nodeName).filter(function(el){
            return el.indexOf("sb-") === -1 && el != "class" && el != "id" && el != "onclick" && el != "href"})
    params = {}
    for (attr of attrs) {
        params[attr] = obj.getAttribute(attr)
    }
    return params
}

// used to load more elements with sbecky ajax
function load(elem) {

    var parent = elem
    var i = 0
    // find parent node with sbecky stuff
    while (parent.getAttribute("sb-bind") == undefined && ++i < 10) {
        parent = parent.parentNode
    }

    var list = _sbecky_search(parent, "[sb-id]")
    var id = 0
    if (list.length > 0){

        // same parent
        var p = list[0].parentNode
        for (ch of p.children) {
            if (ch.getAttribute("sb-id") != undefined)
                id = ch.getAttribute("sb-id")
        }

        // recursive
        // var last = list[list.length - 1]
        // id = last.getAttribute("sb-id")
    }

    params = getParameters(parent)
    params["sb-id"] = id



    if (parent.getAttribute("sb-ajax") == undefined) {
        console.log("Error: sb-ajax not set on parent", parent);
    }else{
        ajax(parent.getAttribute("sb-ajax"), "POST", params, function(response) {
            var name = parent.getAttribute("sb-bind")
            sbecky[name] = response
        }, function() {
            //TODO error handling
        })
    }
}




// Experimental
function getModule(url, complete, retries = 3) {
    ajax(url, "GET", {}, complete, function () {
        if (retries > 0) {
            getModule(url, complete, retries - 1)
        }
    })
}

function sbecky_with_data(moduleurl, url, variable) {
    getModule(moduleurl, function(modulehtml){
        _sbecky_get_with_module(modulehtml, url, variable);
    });
}

function _sbecky_get_with_module(modulehtml, url, puthere) {
    ajax(url, "GET", {}, function(response) {

        var json = JSON.parse(response)
        var dom = createDOM(modulehtml)

        var binds = _sbecky_search(dom, "[sb-bind]")
        var iterates = _sbecky_search(dom, "[sb-iterate]")

        for (var i in iterates) {
            if (iterates.hasOwnProperty(i)) {
                var elem = iterates[i]
                // TODO: search and replace sb-iterate with template
                elements[elem.getAttribute("sb-iterate")] = elem
                var clone = elem.cloneNode(true)
                // elem = elem.parentNode
                // elem.parentNode.innerHTML = ""
                // elem.innerHTML = ""
                var parent = elem.parentNode
                parent.innerHTML = ""
                console.log("inner", parent);
                // parent.innerHTML = ""

                var posts = json[elem.getAttribute("sb-iterate")]

                for (var j in posts) {
                    if (posts.hasOwnProperty(j)) {
                        // console.log("1", elem.cloneNode(true));
                        var post = posts[j]

                        var scp = scope[scope.push({}) - 1]

                        var bindingindex = bindings.push({}) - 1
                        var bng = bindings[bindingindex ]
                        var newdom = clone.cloneNode(true);

                        var binds2 = _sbecky_search(newdom, "[sb-bind]")
                        for (var k in binds2) {
                            if (binds.hasOwnProperty(k)) {
                                _sbecky_register(binds2[k].getAttribute("sb-bind"), scp, bindingindex)

                                bng[binds2[k].getAttribute("sb-bind")] = binds2[k]
                            }
                        }
                        parent.append(newdom)


                        for (var variable in post) {
                            if (post.hasOwnProperty(variable)) {
                                scp[variable] = post[variable]
                            }
                        }
                    }
                }
                sbecky[puthere] = parent
            }
        }


        // for (var item in list) {
        //     if (list.hasOwnProperty(item)) {
        //         var itemdom = list[item];
        //         bindings[itemdom.getAttribute("sb-bind")] = itemdom
        //     }
        // }
        //
        // _sbecky_registerAll();
        //
        //
        // _sbecky_search(modulehtml, )
        // sbecky.posts = modulehtml
        //
        //
        // console.log(modulehtml, response)



    }, function(){
        //TODO handle error
    })
}


function createDOM(string) {
    var parser = new DOMParser()
    return parser.parseFromString(string, "text/xml");
}

HTMLElement.prototype.serialize = function(){
    var obj = {};
    var elements = this.querySelectorAll( "input, select, textarea" );
    for( var i = 0; i < elements.length; ++i ) {
        var element = elements[i];
        var name = element.name;
        var value = element.value;

        if( name ) {
            obj[ name ] = value;
        }
    }
    return obj;
}
