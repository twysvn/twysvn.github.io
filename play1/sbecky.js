
/**
*  General todo
*  - sb-button
*  - sb-error
*
*/

// TODO: support older ios versions
// TODO: if sb-bind af input/textarea radiobuttons -> hau an onchange listener drauf und update noa di variable
// TODO: fix search bind bug
// TODO: sb-ajax method="get"

// element storage
var bindings = [{}]
var ajax_bindings = [{}]
var placeholder = [{}]
var forms = [{}]
var errors = [{}]
var buttons = [{}]
// var controls

// listeners
var sbecky_change_listeners = {}
var sbecky_oninput_listeners = {}
// var sbecky_oninput_listeners = {}
var sbecky_onclick_listeners = {}
var sbecky_onresponse_listeners = {}
var sbecky_onresponse_error_listeners = {}
var sbecky_onsubmit_listeners = {}

// other
var elements = {}
var prefix = "_sbecky_"
var _internal_vars = 0
var sbecky ={}
var scope = []

var _sbecky_scroll_trigger = []

var _sbecky_is_ready = false;

// private config variables
var _sbecky_sould_call_change = true

var _sbecky_events_enabled = true

var _sbecky_ready = []

function _sbecky_get_new_binding() {
    return (prefix + (_internal_vars++))
}

function _sbecky_on_change(variable){
    return function(value) {
        for (var dom of bindings[0][variable]) {
            if (typeof value == "object") {
                dom.append(value)
            } else {
                var name = dom.tagName.toLowerCase()
                for (var c of dom.children) {
                    c.setAttribute("_sbecky_old", "")
                }
                if (name == "input" || name == "textarea" || name == "select"){ // TODO: test
                    if (!dom.hasAttribute("sb-active")) {
                        dom.value = value
                    }else{
                        dom.removeAttribute("sb-active")
                    }
                } else if (dom.getAttribute("sb-ajax") != undefined && dom.getAttribute("items") != undefined) {
                    // sb-ajax + items means append content
                    if (value.length > 0){
                        var wrapper = document.createElement(name);
                        wrapper.innerHTML = value;

                        while (wrapper.firstChild) {
                            dom.appendChild(wrapper.firstChild);
                        }

                        // dom.innerHTML += value
                    }
                } else {
                    // normal set
                    _sbecky_unbind(dom)
                    dom.innerHTML = value
                }
                for (var c of dom.children) {
                    if (!c.hasAttribute("_sbecky_old")){
                        _sbecky_search_and_register(c);
                        _sbecky_search_async_img();
                    }else{
                        c.removeAttribute("_sbecky_old")
                    }
                }
            }
        }
    }
}

function _sbecky_ajax_onclick_wrapper(el) {
    return function() {
        _sbecky_call_onclick(el.getAttribute("sb-bind"))
        sbecky_load(el.getAttribute("sb-bind"))
        // load(el, _sbecky_call_onresponse, _sbecky_call_onresponse_error)
        return false;
    }
}

function _sbecky_register_all(new_bindings) {
    for (var i in new_bindings) {
        if (new_bindings.hasOwnProperty(i)) {
            _sbecky_register(new_bindings[i].getAttribute("sb-bind"), new_bindings[i])
        }
    }
}

function _sbecky_register(variable, object) {

    // don't rebind
    // if (obj[variable] != undefined)
    //     return
    /* eslint-disable no-console */
    console.log("sbecky: register " + variable);
    // console.trace()

    var on_change = _sbecky_on_change(variable)
    var key = "_"+variable
    if (sbecky[key] == undefined) {
        sbecky[key] = {}
        Object.defineProperty(sbecky, variable, {
            get: function(){
                // console.log("get", variable, this);
                return this["_"+variable];
            },
            set: function(val){
                this["_"+variable] = val
                if(_sbecky_sould_call_change)
                    _sbecky_call_oninput(variable, val)
                // console.log("set", variable, this);
                on_change(val)
            }
        });
        // sbecky[variable] = sbecky[variable]
    }

    var name = object.tagName.toLowerCase()
    if (name == "input" || name == "textarea" || name == "select"){ // TODO: test, select?, checkbox?, radioboxes?, slider
        object.oninput = function() {
            var bind = this.getAttribute("sb-bind")
            this.setAttribute("sb-active", "true");
            sbecky[bind] = this.value
        };
        if (object.hasAttribute("value")) {
            sbecky[variable] = object.value;
            // console.log("setting value");
        }

        // if(sbecky[dom.getAttribute("sb-bind")])
        //     dom.value = sbecky[dom.getAttribute("sb-bind")]

        // maybe oninput?
        object.onchange = function() {
            var variable = this.getAttribute("sb-bind")
            _sbecky_call_change(variable, this.value)
            // sbecky[bind] = this.value
        }
    }else{
        var obj = sbecky[variable];
        //if value is not yet set
        if(typeof obj === "object" &&
            Object.keys(obj).length === 0 &&
            obj.constructor === Object)
        {
            sbecky["_"+variable] = object.innerHTML
        }else{
            object.innerHTML = obj
        }
    }
}

function _sbecky_register_buttons(list) {
    var index = 0
    for (var i in list) {
        if (list.hasOwnProperty(i)){
            var name = list[i].getAttribute("sb-button")
            if(ajax_bindings[index].hasOwnProperty(name)){
                var b = ajax_bindings[index][name]
                list[i].addEventListener('click', _sbecky_ajax_onclick_wrapper(b), false);
            }else{
                // buttons[index][i].setAttribute("href", "javascript:void(0)");
                list[i].addEventListener('click', _sbecky_button_onclick, false);
                // buttons[index][i].onclick = _sbecky_button_onclick
            }
        }
    }
}

function _sbecky_register_forms(list){
    for (var i in list) {
        if (list.hasOwnProperty(i)) {
            var name = list[i].getAttribute("sb-form");
            if (name == "") {
                name = _sbecky_get_new_binding();
            }
            list[i].setAttribute("sb-form", name);
            list[i].addEventListener("submit", function(e) {
                e.preventDefault();

                var type = this.getAttribute("method");
                var url = this.getAttribute("action");
                var data = this.serialize();
                data.append("sb-form", this.getAttribute("sb-form"));

                _sbecky_add_placeholder(name, 1)

                _sbecky_call_onsubmit(name, e);
                (function (self) {
                    _sbecky_form_ajax(url, type, data, function(d){
                        // Todo: validate

                        _sbecky_remove_placeholder(self)

                        var n = self.getAttribute("sb-form");
                        _sbecky_call_onresponse(n, d);
                        sbecky[n] = d;
                    }, function(d){
                        // Todo: error, validate

                        if(!_sbecky_add_error_placeholder(n))
                            sbecky[n] = d;// legacy support
                        var n = self.getAttribute("sb-form");
                        _sbecky_call_onresponse_error(n, d);
                    });
                })(this);
            }, false);
        }
    }
}

function _sbecky_form_ajax(url, type, data, success, error) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if(this.status === 200) {
                success(this.responseText)
            }else{
                error(this.responseText)
            }
        }
    };
    xhttp.open(type, url, true);
    xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhttp.send(data);
}


function _sbecky_search(data, query) {
    var nl = data.querySelectorAll(query)
    return nl

    // fix?
    var list = [];
    for(var i = nl.length; i--; list.unshift(nl[i]));
    var p = data.parentNode
    if(p) {
        var qs = p.querySelectorAll(query)
        for (var j in qs) {
            if (qs.hasOwnProperty(j) && qs[j] == data) {
                list.push(qs[j])
            }
        }
    }
    return list
}

function _sbecky_search_all(data) {

    var keywords = [
            "[sb-placeholder]",
            "[sb-error]",
            "[sb-button]",
            "[sb-bind]",
            "[sb-ajax]",
            "[sb-form]",
            "[sb-id]"]
    var ret = {}
    for (kw of keywords) {
        ret[kw] = _sbecky_search(data, kw)
    }
    return ret
}

function _sbecky_unbind(data) {
    var all = _sbecky_search_all(data)

    console.log("sbecky: unbind", all)

    // placeholder
    // for(var item of all["[sb-placeholder]"]) {
    //     placeholder[0][item.getAttribute("sb-placeholder")] = undefined
    // }

    // errors?
    // for(var item of all["[sb-error]"]) {
    //     placeholder[0][item.getAttribute("sb-error")] = undefined
    // }

    for(var item of all["[sb-button]"]) {
        buttons[0][item.getAttribute("sb-button")] = undefined
    }

    for(var item of all["[sb-bind]"]) {
        var index = bindings[0][item.getAttribute("sb-bind")].indexOf(item)
        if(index > -1) {
            bindings[0][item.getAttribute("sb-bind")].splice(index);
        }
    }

    for(var item of all["[sb-form]"]) {
        forms[0][item.getAttribute("sb-form")] = undefined
    }

    for(var item of all["[sb-ajax]"]) {
        ajax_bindings[0][item.getAttribute("sb-ajax")] = undefined
    }
}

function _sbecky_search_and_register(data) {
    var new_bindings = []

    var all = _sbecky_search_all(data)

    // load placeholder from dom
    // var list = _sbecky_search(data, "[sb-placeholder]")
    var list = all["[sb-placeholder]"]
    for (var item of list) {
        placeholder[0][item.getAttribute("sb-placeholder")] = item.outerHTML
        item.parentNode.removeChild(item);
    }

    // errors
    // list = _sbecky_search(data, "[sb-error]")
    list = all["[sb-error]"]
    for (item of list) {
        errors[0][item.getAttribute("sb-error")] = item.outerHTML
        item.parentNode.removeChild(item);
    }

    // buttons
    // list = _sbecky_search(data, "[sb-button]")
    list = all["[sb-button]"]
    for (item of list) {
        buttons[0][item.getAttribute("sb-button")] = item
    }

    // binding
    // list = _sbecky_search(data, "[sb-bind]")
    list = all["[sb-bind]"]
    for (item of list) {
        if (bindings[0][item.getAttribute("sb-bind")] == undefined)
            bindings[0][item.getAttribute("sb-bind")] = [item]
        else{
            bindings[0][item.getAttribute("sb-bind")].push(item)
            // item.value = sbecky[item.getAttribute("sb-bind")]
        }
        new_bindings.push(item)
    }

    // if sb-bind is missing map internally
    // list = _sbecky_search(data, "[sb-ajax]")
    list = _sbecky_search(data, "[sb-ajax]")
    for (item of list) {
        var name = item.getAttribute("sb-bind")
        if (name == undefined || name == null) {
            name = _sbecky_get_new_binding()
            item.setAttribute("sb-bind", name)
            bindings[0][name] = [item]
            new_bindings.push(item)
        }
    }

    _sbecky_register_all(new_bindings);

    // ajax
    for (item of list) {
        _sbecky_sb_ajax(item)
    }

    // list = _sbecky_search(data, "[sb-button]")
    list = all["[sb-button]"]
    _sbecky_register_buttons(list)

    // forms
    // list = _sbecky_search(data, "[sb-form]")
    list = all["[sb-form]"]
    for (item of list) {
        forms[0][item.getAttribute("sb-form")] = item
    }
    _sbecky_register_forms(list)

    if(data != document){
        var el = data
        // var scripts = _sbecky_search(data, "script")
        // for (var i in scripts) {
        //     if (scripts.hasOwnProperty(i)) {
        //         // console.log(scripts[i].innerHTML);
        //         eval(scripts[i].innerHTML);
        //     }
        // }

        var scripts = el.querySelectorAll('script'),
            script, fixedScript, i, len;

        for (i = 0, len = scripts.length; i < len; i++) {
            script = scripts[i];
            fixedScript = document.createElement('script');
            fixedScript.type = script.type;
            if (script.innerHTML) fixedScript.innerHTML = script.innerHTML;
            else fixedScript.src = script.src;
            fixedScript.async = false;
            script.parentNode.replaceChild(fixedScript, script);
        }
    }else{
        // list = _sbecky_search(data, "[sb-id]")
        list = all["[sb-id]"]
        for(item of list)
            console.log("sb-id found. did you mean sb-bind?", item);
    }
}


function _sbecky_poll(item, time = 1000) {
    setTimeout(function functionName() {
        _sbecky_ajax_wrapper(item, undefined, function () {
            _sbecky_poll(item, time)
        })
    }, time);
}

function _sbecky_add_placeholder(name, items=0) {
    if (placeholder[0][name] != undefined){
        if (params["items"] != undefined){
            for (var i=0; i < items; i++) {
                sbecky[name] = placeholder[0][name]
            }
            return true
        }else{
            sbecky[name] = placeholder[0][name]
            bindings[0][name].innerHTML = placeholder[0][name]
            return true
        }
    }
    return false
}

function _sbecky_remove_placeholder(el) {
    var list = _sbecky_search(el, "[sb-placeholder]")
    for (var item of list) {
        item.parentNode.removeChild(item);
    }
}

function _sbecky_add_error_placeholder(name){
    if (errors[0][name] != null) {
        sbecky[name] = errors[0][name]
        return true
    }
    return false
}

function _sbecky_remove_error_placeholder(el) {
    var list = _sbecky_search(el, "[sb-error]")
    for (var item of list) {
        item.parentNode.removeChild(item);
    }
}

function _sbecky_sb_ajax(item) {
    var name = item.getAttribute("sb-bind")
    var params = getParameters(item)

    // add placeholder
    _sbecky_add_placeholder(name, params["items"])

    // only do on initial item
    if (ajax_bindings[0][name] == undefined) {
        ajax_bindings[0][name] = item

        if (item.hasAttribute("sb-trigger-on")) {
            (function(item, params) {
                var event = item.getAttribute("sb-trigger-on")

                if (event == "none") {
                }else if (event == "poll" || event == "short-poll") {
                    var time = 1000;
                    if (event == "short-poll") {
                        time = 10;
                    }else if(item.hasAttribute("poll-interval")){
                        time = parseInt(item.getAttribute("poll-interval"));
                    }
                    _sbecky_poll(item, time)
                    _sbecky_ajax_wrapper(item, params)
                }else if(event == "scroll-end"){
                    // TODO: scroll-end implementiern

                    _sbecky_scroll_trigger.push(item)
                    _sbecky_ajax_wrapper(item)

                }else{
                    item.addEventListener(event, function(e) {
                        // TODO: max 1 reqquest per second?
                        // e.stopPropagation();
                        var el = e.fromElement || e.relatedTarget;
                        if (el != null && el != this.parentNode) {
                            return;
                        }
                        // console.log("called");
                        _sbecky_ajax_wrapper(item)
                    });
                }
            })(item, params);
        }else{
            _sbecky_ajax_wrapper(item, params/*, data*/) // Fir wos brauchts do data?
        }
    }
}

window.addEventListener("scroll", function(){
    var doc = document.documentElement;
    if(doc){

        var scroll_offset_bottom = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0) + window.innerHeight;

        for (el of _sbecky_scroll_trigger) {
            var end_pos = el.getBoundingClientRect().top + document.documentElement.scrollTop + el.offsetHeight
            if (scroll_offset_bottom >= end_pos) {
                _sbecky_ajax_wrapper(el)
            }
        }

    }
})

function sbecky_load(variable) {
    if (ajax_bindings[0][variable] != undefined) {
        _sbecky_ajax_wrapper(ajax_bindings[0][variable])
    }else{
        console.log("sbecky: debug! sbecky_load could not find", variable, ajax_bindings[0]);
    }
}

var is_loading = [];
function remove_is_loading(name) {
    var index = is_loading.indexOf(name);
    if (index > -1) {
        is_loading.splice(index, 1);
    }
}

function _sbecky_ajax_wrapper(it, params=undefined, finished=undefined, errorfinished=undefined) {
    if(params == undefined)
        params = getParameters(it)

    var name = it.getAttribute("sb-bind")
    // var ids = _sbecky_search(it, "[sb-id]")

    // prevend loading more often
    if(is_loading.indexOf(name) >= 0)
        return;
    is_loading.push(name)

    if (buttons[0][name] != undefined) {
        buttons[0][name].style.display = "none";
        // console.log("hide button");
    }

    if(params["items"] == undefined/* || ids.length < parseInt(params["items"])*/) {
        (function (n, d) {
            ajax(d.getAttribute("sb-ajax"), "POST", params, function(response) {
                // remove placeholder
                // var list = _sbecky_search(d, "[sb-placeholder]")
                // for (var item of list) {
                //     item.parentNode.removeChild(item);
                // }
                _sbecky_remove_placeholder(d)

                if (buttons[0][name] != undefined && buttons[0][name].style.display == "none") {
                    buttons[0][name].style.display = "inline-block";
                }

                sbecky[n] = response
                // console.log(bindings[0][n][0].children[0]);
                // bindings[0][n][0].children[0].addEventListener("load", function() {
                //     console.log("load finished");
                //
                // })
                if (finished != undefined) {
                    finished(response);
                }
                remove_is_loading(n)
                _sbecky_call_onresponse(n, response)
            }, function(e) {
                _sbecky_remove_placeholder(bindings[0][n][0])
                _sbecky_add_error_placeholder(n)
                if (errorfinished != undefined) {
                    errorfinished(e);
                }
                remove_is_loading(n)
                _sbecky_call_onresponse_error(n, e)
            });
        })(name, it /* do kannt ah data kemmen */);
    }else{
        load(it)
    }
}

// used to load more elements with sbecky ajax (only load more part)
//      load more + normal ajax konn di sbecky_load(el)
function load(elem, succ=undefined, err=undefined) {
    var parent = elem

    var list = _sbecky_search(parent, "[sb-id]")
    var id = 0

    //only use sb-id if no parent has sb-bind
    for (c of list) {
        var p = c.parentNode;
        var set = true;
        while(p != null && p != undefined && p != elem)  {
            if (p.hasAttribute('sb-bind')) {
                set = false;
            }
            p = p.parentNode;
        }
        if (set) {
            id = c.getAttribute("sb-id");
        }
    }

    params = getParameters(parent)
    params["sb-id"] = id

    var name = parent.getAttribute("sb-bind")
    if (parent.getAttribute("sb-ajax") == undefined) {
        console.log("Error: sb-ajax not set on parent", parent);
    }else{
        (function(n, d, params){
            ajax(d.getAttribute("sb-ajax"), "POST", params, function(response) {

                // if load-more-button is hidden -> show
                if (buttons[0][name] != undefined && buttons[0][name].style.display == "none") {
                    buttons[0][name].style.display = "inline-block";
                }

                // var list = _sbecky_search(d, "[sb-placeholder]")
                // for (var it of list) {
                //     it.parentNode.removeChild(it);
                // }
                _sbecky_remove_placeholder(d)

                // remove button if no sb-id in response
                if (response.indexOf("sb-id") == -1) {
                    var btn = buttons[0][n]
                    if (btn != undefined)
                        btn.parentNode.removeChild(btn)
                }

                // only set variable if response contains sb-id
                if (response.indexOf("sb-no-set") == -1) {
                    sbecky[n] = response
                }

                if(succ) succ(n, response)
                remove_is_loading(n)
                _sbecky_call_onresponse(n, response)
            }, function(err) {
                //TODO error handling
                if(err) err(n, err)
                remove_is_loading(n)
                _sbecky_call_onresponse_error(n, err)
            })
        })(name, parent, params);
    }
}


function _sbecky_button_onclick(e) {
    e.preventDefault()
    _sbecky_call_onclick(name)
    var params = getParameters(this)
    var url = this.getAttribute("href")
    var name = this.getAttribute("sb-button");
    (function(self){
        // TODO: dont do ajax until response from last received
        ajax(url, "POST", params, function(response) {
            //Todo: handle callback
            // self.innerHTML = response
            // var r = document.createTextNode(response)
            // self.parentNode.replaceChild(self, r)
            sbecky[self.getAttribute("sb-button")] = response

            _sbecky_call_onresponse(name, response)
        }, function(e) {
            //Todo: handle error callback

            // TODO: maybe?
            sbecky[self.getAttribute("sb-button")] = e

            // self.innerHTML = response
            _sbecky_call_onresponse_error(name, e)
        });
    })(this);
    return false
}

window.onload = function() {
    _sbecky_search_and_register(document)
    console.log("sbecky is ready.");
    _sbecky_is_ready = true;
    for (var fun of _sbecky_ready) {
        fun();
    }
    _sbecky_search_async_img();
}

//folls mor amol probleme hobm -> var DOMReady = function(a,b,c){b=document,c='addEventListener';b[c]?b[c]('DOMContentLoaded',a):window.attachEvent('onload',a)}
function sbecky_ready(fun) {
    if (_sbecky_is_ready)
        fun()
    else
        _sbecky_ready.push(fun)
}

function sbecky_get(variable) {
    return bindings[0][variable]
}

// button click
function sbecky_onclick(variable, f) {
    console.log("sbecky: register onclick", variable);
    if (sbecky_onclick_listeners[variable] == undefined){
        sbecky_onclick_listeners[variable] = [f]
    } else {
        sbecky_onclick_listeners[variable].push(f)
    }
}

function _sbecky_call_onclick(variable) {
    if(_sbecky_events_enabled)
        if (sbecky_onclick_listeners[variable] != undefined)
            for (var f of sbecky_onclick_listeners[variable]) {
                f()
            }
}

// button click ajax done
function sbecky_onresponse(variable, f) {
    console.log("sbecky: register onresponse", variable);
    if (sbecky_onresponse_listeners[variable] == undefined){
        sbecky_onresponse_listeners[variable] = [f]
    } else {
        sbecky_onresponse_listeners[variable].push(f)
    }
}

function _sbecky_call_onresponse(variable, param) {
    if(_sbecky_events_enabled)
        if (sbecky_onresponse_listeners[variable] != undefined)
            for (var f of sbecky_onresponse_listeners[variable]) {
                f(param)
            }
}

// button click ajax error
function sbecky_onresponse_error(variable, f) {
    console.log("sbecky: register onresponse_error", variable);
    if (sbecky_onresponse_error_listeners[variable] == undefined){
        sbecky_onresponse_error_listeners[variable] = [f]
    } else {
        sbecky_onresponse_error_listeners[variable].push(f)
    }
}

function _sbecky_call_onresponse_error(variable, param) {
    if(_sbecky_events_enabled)
        if (sbecky_onresponse_error_listeners[variable] != undefined)
            for (var f of sbecky_onresponse_error_listeners[variable]) {
                f(param)
            }
}

// input onchange event
function sbecky_onchange(v, f) {
    sbecky_change(v, f)
}

function sbecky_onsubmit(variable, f) {
    console.log("sbecky: register onsubmit", variable);
    if (sbecky_onsubmit_listeners[variable] == undefined){
        sbecky_onsubmit_listeners[variable] = [f]
    } else {
        sbecky_onsubmit_listeners[variable].push(f)
    }
}

function _sbecky_call_onsubmit(variable, param) {
    if(_sbecky_events_enabled)
        if (sbecky_onsubmit_listeners[variable] != undefined)
            for (var f of sbecky_onsubmit_listeners[variable]) {
                f(param)
            }
}

function sbecky_change(variable, f) {
    console.log("sbecky: register onchange", variable);
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

function sbecky_oninput(variable, f) {
    console.log("sbecky: register onchange", variable);
    if (sbecky_oninput_listeners[variable] == undefined){
        sbecky_oninput_listeners[variable] = [f]
    } else {
        sbecky_oninput_listeners[variable].push(f)
    }
}

function _sbecky_call_oninput(variable, param) {
    if (sbecky_oninput_listeners[variable] != undefined)
        for (var f of sbecky_oninput_listeners[variable]) {
            f(param)
        }
}

// // oninput
// function sbecky_oninput(v, f) {
//     sbecky_change(v, f)
// }
//
// function sbecky_oninput(variable, f) {
//     if (sbecky_change_listeners[variable] == undefined){
//         sbecky_change_listeners[variable] = [f]
//     } else {
//         sbecky_change_listeners[variable].push(f)
//     }
// }


// std ajax request
function ajax(url, type, params={}, success, error) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if(this.status === 200) {
                success(this.responseText)
            }else{
                error(this.responseText)
            }
        }
    };

    xhttp.open(type, url, true);
    xhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
    }).join('&'));
}

// get request
function get(url, data, success, error = function(){}) {
    url += "?" + Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    }).join('&');
    ajax(url, "GET", {}, success, error)
}

// post request
function post(url, data, success, error = function(){}) {
    ajax(url, "POST", data, success, error)
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


/*
    Async Image loading
*/
function _sbecky_search_async_img(){
    var images = document.getElementsByTagName('img');
    _sbecky_handle_async(images)
    var iframes = document.getElementsByTagName('iframe');
    _sbecky_handle_async(iframes)
}
function _sbecky_handle_async(objs) {
    // TODO: fix placeholder
    for (var i in objs) {
        if (objs.hasOwnProperty(i)) {
            var obj = objs[i];
            if (obj.hasAttribute('sb-async-src')) {
                // img.classList.add("async-img");
                obj.setAttribute('src', obj.getAttribute('sb-async-src'));
                obj.removeAttribute('sb-async-src');
            }
        }
    }
}


// window.addEventListener('load', function(){
// }, false);


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

// normal serialize
HTMLElement.prototype.serialize = function() {
    var data = new FormData(this);
    wat = data
    var finput = this.getElementsByTagName("input")
    var j=0
    for (var i in finput) {
        if (finput.hasOwnProperty(i)) {
            var input = finput[i]
            // console.log(input, input.files);
            if (input.getAttribute("type") == "file"){
                if (input.files.length > 0) {
                    var lefile = input.files[0]
                    if(input.hasAttribute("name")
                            && input.hasAttribute("name")!= null
                            && input.hasAttribute("name") != undefined
                            && input.hasAttribute("name") != ""){
                        // console.log("append has name", input.getAttribute("name"));
                        data.append(input.getAttribute("name"), lefile);
                    }else{
                        // console.log("append no name");
                        data.append(""+j, lefile);
                    }
                }
                j++
            }
        }
    }
    return data
}


HTMLElement.prototype.serialize_dom = function() {

    var data = new FormData();
    var elements = this.querySelectorAll( "input, select, textarea" );
    for( var i = 0; i < elements.length; ++i ) {
        var element = elements[i];
        var name = element.name;
        var value = element.value;

        if( name ) {
            data.append(name, value);
        }
    }
    var finput = this.getElementsByTagName("input")
    var j=0
    for (var i in finput) {
        if (finput.hasOwnProperty(i)) {
            var input = finput[i]
            // console.log(input, input.files);
            if (input.getAttribute("type") == "file"){
                if (input.files.length > 0) {
                    var lefile = input.files[0]
                    if(input.hasAttribute("name")
                            && input.hasAttribute("name")!= null
                            && input.hasAttribute("name") != undefined
                            && input.hasAttribute("name") != ""){
                        data.append(input.getAttribute("name"), lefile);
                    }else{
                        // add wenns koan name tag het
                        data.append(""+j, lefile);
                    }
                }
                j++
            }
        }
    }
    return data
}
