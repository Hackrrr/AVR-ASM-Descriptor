/*

**********   JavaScript - module Functions.js   **********
**********            Version: 2.3.3            **********
**********   Date of publication: 14. 2. 2021   **********
**********           Author:  Hackrrr           **********

NOTE:   Hackrrr is not author of all these codes (functions) - Some of these codes (functions) are creations of someone else.
        In most cases (when it is not Hackrrr) is original author written in REF.


Variables:
const abc                           - EN alphabet in small.
                                      Use abc.toUpperCase() to get big EN alphabet.
const consoleCss_error              - Css style for styling errors in console.
                                      Use: console.log("%cSome error message", consoleCss_error)
const consoleCss_warning            - Css style for styling warnings in console.
                                      Use: console.log("%cSome warning message", consoleCss_warning)
const consoleCss_info               - Css style for styling info in console.
                                      Use: console.log("%cSome info message", consoleCss_info)
const debugVar                      - Only for debug; Leave it as empty string for normal use.
                                    - Ref: debug()
const moduleInfo                    - Info about this document.

Functions:
setCookie(str0, any0, int0)         - Creates a cookie with name [str0] and value [any0] ([any0] should be a string). Cookie expires after [int0] days.
getCookie(str0)                     - Returns value of cookie with name [str0].
killCookie(str0)                    - Destroys cookie with name [str0].
getRandom(int0, int1)               - Returns 'random' natural number between [int0] and [int1] (both inclusive).
getRandomElement(arr0)              - Returns random element of array [arr0].
getHttpVar(str0)                    - Returns value of super global variable (in HTTP/HTTPS adress) with name [str0].
haveUpperCase(str0)                 - Checks if string [str0] have letter in upper case. If true, return true, else return false.
haveLowerCase(str0)                 - Checks if string [str0] have letter in lower case. If true, return true, else return false.
getStyle(obj0, str0)                - Returns value of style [str0] of DOM object [obj0].
                                    - '4th' party script - REF: https://stackoverflow.com/questions/2664045/how-to-get-an-html-elements-style-values-in-javascript
                                    - NOTE: Instead of this function you can use direct DOM method "DOMobject.style.styleAtribute", but this refers to DOM style atributes ONLY (no CSS).
functionName(int0)                  - Returns name of [int0]th parent function of this function. (0 = current function)
imagePreload(arr0, fnc0)            - Preloads images with paths in arr0. At end calls fnc0 with parameter true or false (if all images loads succesfully, parameter is true, else it is false).
                                    - If is parameter fnc0 false, it also writes into console array with unsuccess files (if is ImagePreloader in enabled sources).
degToRad(int0)					    - Returns [int0] degrees converted to radians.
radToDeg(int0)					    - Returns [int0] radians converted to degrees.
debug(str0, str1, str2)             - Function for debug only.
                                    - Writes debug logs into console.
                                    - DON'T FORGET TO DEFINE debugVar! <= This function writes logs only from sources [str0] (splitted with " "), that are written into debugVar.
                                      If is source (or tag [str2] (Error or Warning)) allowed, it write message [str2] into console. If it has a tag, it will receive special style.
loadScript(str0, fnc0)              - Loads script with url [str0].
                                      If loading was successful, call function [fnc0] with boolean true as argument, else with false as argument.
isValid(any0, bol0)                 - Check, if [any0] is undefined, null or NaN. And if [bol0], it checks for "" and [].
                                      If [any0] is equal something above, it returns false, else it returns true.
                                    - NOTE: 0 and false are not checked because 0 and false are mostly valid too. 
startKeyRecord()                    - Function for debug only.
                                    - Logs pressed key keyCode into console.
AJAXRequest(str0, fnc0, str1, int0) - Performs a AJAX request for web at [str0] with method [str1] ("GET" or "POST") and call [fnc0] as callback.
                                    - Callback (= [fnc0]) should have three parameters:
                                        1. [bol0]   - Indicates success of request  - It is true only if final response status is 200.
                                        2. [str0]   - Response text                 - Usually content of page but it can be a error message (if error occurs).
                                        3. [int0]   - Response status               - Normal HTTP codes - Success = 200, invalid page = 404, ... Special is -1 - That is some non-http error (e.g. CORS policy).
                                    - [int0] is a timeout to wait for response or fail. If is timeout reached before event, it will call a callback with timeout error message and status -1 (and false as success indicator) .
Method functions:
methodLast(arr0)                    - REF: Array.last() in methods reference.
methodRemove(arr0, any0)            - REF: Array.remove() in methods reference.

Methods:
*Array.last()*                      - Return last element in array.
*Array.remove(any0)*                - Sets index with value [any0] to undefined.
String.replaceAll(str0, str1, bol0) - Return string with replaced all [str0] with [str1].
                                      If [bol0] is true or undefined, search is case sensitive, so if [bol0] is false, search is case insensitive.

TO DO:
    So this is start of 'To Do'... Just some notes what to do to next release of this
    - Make next-gen distribution of this file OR for now only split to Documentation, Changelog, To do list and code
    - Make altarnations of all thigs there for idiots that will try to enter an infinity array (if something like this exists) as parameter
    - Try, debug and fix image preload (fix is maybe to save images as elements)
    - Fix 'functionName()' for window scope (maybe is related to second note in To Do List)
    - Test 'isValid()'
    - Test 'loadScript()' (especially for cross-site scripts and update REF if it is supported or not)

CHANGELOG:
    v2.3.3:
        - Added getRandomElement()
    Latest:
        So this is start of 'Changelog'...
        - Added 'Changelog' and 'To Do' sections
        - Quick refraction of functions - Replaced 'var' for 'let' and 'const'
        - Smaller functions are remaked as const variables with anonymous funtions
        - Added 'AJAXrequest()'


NOTE v1.6.0:    This Array.prototype.function() sets this function at index named like function in array and this transforms all arrays into objects!
                E.g. Array.last() => every array have function used for last method at "last" index.
                This causes that for...in loop had every time extra loop for every of these methods so it needs to filter this indexs!!!
                Solution is Array.hasOwnProperty(), but if is there lots of arrays, it is difficult to implement it.

                Result: Because of this, ALL Array.prototype methods has been commented and intead of these methods has been created (method) functions, that returs everything like methods, but at argument 0 they takes target array.

NOTE: *Variables/Function/Method* = Commented; Realy only comented, so you can see it...

BUGS/ISSUES:
    - every function/method - They aren't idiots proof (they don't check if are data types right) (make two files - one idiot proof and second open (open have always better performance))
    - functionName()        - Window scope call             - If you try to get name of window, it trow an error.
                                                            Solution: try...catch
*/

const abc = "abcdefghijklmnopqrstuvwxyz";
const consoleCss_error = "border-left: 5px rgba(250, 0, 0, 0.9) solid; padding: 2px 7px; background: rgba(205, 0, 0, 0.3); font-size: 12px;";
const consoleCss_warning = "border-left: 5px rgba(250, 200, 50, 0.9) solid; padding: 2px 7px; background: rgba(205, 205, 0, 0.3); font-size: 12px;";
const consoleCss_info = "border-left: 5px rgba(0, 0, 250, 0.9) solid; padding: 2px 7px; background: rgba(0, 0, 155, 0.3); font-size: 12px;";
//Values for debugVar: Proxy, ObjectCreator, Warning, Error, ImagePreloader
const debugVar = "Error Warning ImagePreloader".split(" ");
const moduleInfo = "Funcions.js - v2.3.3; Publication: 14. 2. 2021; Author: Hackrrr (see REF)";

function getCookie(name) {
    var name = name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var end = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + end + ";path=/";
}

const killCookie = (name) => document.cookie = name + "=; expires=Thu, 01 Jan 1000 00:00:00 UTC; path=/;";

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[getRandom(0, arr.length)];

function getHttpVar(variable) {
    var str = window.location.search.substring(1);
    str = decodeURIComponent(str);
    str = str.split("&");
    for (var i = 0; i < str.length; i++) {
        var temp = str[i].split("=");
        if (temp[0] == variable) {
            return temp[1];
        }
    }
}

const haveUpperCase = (str) => str.toLowerCase() !== str;

const haveLowerCase = (str) => str.toUpperCase() !== str;

function getStyle(el, styleProp) {
    let value, defaultView = (el.ownerDocument || document).defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
        // sanitize property name to css notation
        // (hypen separated words eg. font-Size)
        styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
        return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) { // IE
        // sanitize property name to camelCase
        styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
            return letter.toUpperCase();
        });
        value = el.currentStyle[styleProp];
        // convert other units to pixels on IE
        if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
            return (function (value) {
                var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
                el.runtimeStyle.left = el.currentStyle.left;
                el.style.left = value || 0;
                value = el.style.pixelLeft + "px";
                el.style.left = oldLeft;
                el.runtimeStyle.left = oldRsLeft;
                return value;
            })(value);
        }
        return value;
    }
}

function functionName(nthParrent) {
    let func = functionName.caller;
    if (typeof nthParrent == "undefined") {
        nthParrent = 1;
    }
    for (var x = 0; x < nthParrent - 1; x++) {
        func = func.caller;
    }
    return "function " + func.name + "()";
}


// TODO: Probraly not working... (No console messages)
function imageProload(imgPathArr, callback) {
    const img = new Image();
    let failed = new Array();
    img.onload = function () {
        imgPathArr.shift();
        if (imgPathArr.length > 0) {
            img.src = imgPathArr[0];
        } else {
            if (typeof callback == "function") {
                if (failed.length > 0) {
                    debug("ImagePreloader", "Failed to load these images:\n" + failed.join("\n"), "Warning");
                    callback(false);
                } else {
                    callback(true);
                }
            }
        }
    }
    img.onerror = function () {
        failed.push(imgPathArr.shift());
        if (imgPathArr.length > 0) {
            img.src = imgPathArr[0];
        } else {
            if (typeof callback == "function") {
                if (failed.length > 0) {
                    debug("ImagePreloader", "Failed to load these images:\n" + failed.join("\n"), "Warning");
                    callback(false);
                }
            }
        }
    }
    img.src = imgPathArr[0];
}

const degToRad = (int) => int * Math.PI / 180;

const radToDeg = (int) => int * 180 / Math.PI;

function debug(source, msg, tag) {
    let sources = source.split(" ");
    if (sources.some(function (el) { return debugVar.includes(el) }) || ((tag == "Error" && debugVar.includes("Error")) || (tag == "Warning" && debugVar.includes("Warning")))) {
        msg = "Source: " + source + "\n \n" + msg;
        if (tag == "Error") {
            throw Error(msg);
        } else if (tag == "Warning") {
            console.warn(msg);
        } else {
            console.log("%c" + msg, consoleCss_info);
        }
    }
}

function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    if (typeof callback == "function") {
        script.onreadystatechange = callback(true);
        script.onload = callback(true);
        script.onerror = callback(false);
    }
    document.head.appendChild(script);
}

function isValid(variable, all) {
    if (all) {
        if (variable !== undefined && variable !== "" && variable !== [] && variable !== NaN) {
            return true;
        } else {
            return false;
        }
    } else {
        if (variable !== undefined && variable !== NaN) {
            return true;
        } else {
            return false;
        }
    }
}

function startKeyRecord() {
    document.body.addEventListener("keydown", function () { console.log(event.keyCode); });
}

function AJAXRequest(target, callback, method = "GET", timeout = 5000) {
    const request = new XMLHttpRequest();
    let timeouted = false;
    let ended = false;
    request.onreadystatechange = function() {
        if (ended) return;
        if (timeouted) {
            ended = true;
            callback(false, "AJAX request timed out", -1);
            return;
        }
        if (this.readyState == request.DONE) {
            if (this.status == 200) callback(true, request.responseText, 200);
            else callback(false, request.responseText, this.status);
        }
    }
    request.onerror = function(e) {
        ended = true;
        callback(false, "Undefined error called trigerred by XMLHttpRequest().onerror()", -1);
    }
    //Maybe can be removed
    request.onabort = function() {
        ended = true;
        callback(false, "Undefined error called trigerred by XMLHttpRequest().onabort()", -1);
    }
    request.open(method, target, true);
    request.send();
    setTimeout(() => timeouted = true, timeout);
}






/* Commented - Cause: NOTE to methods in version 1.6.0
TODO: Try set prototype methods invisible
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

// TODO: Add Array.remove()

*/

function methodLast(arr) {
    return arr[arr.length - 1];
}

function methodRemove(arr, str) {
    arr[arr.indexOf(str)] = undefined;
    return arr;
}

String.prototype.replaceAll = function (search, replacement) {
    var returnValue = this;
    return returnValue.split(search).join(replacement);
}

if (debugVar != "" && debugVar != []) {
    console.log("%c*****    DEBUG  INFO    *****\n" + moduleInfo + "\nEnabled Debug Sources: " + debugVar.join(", ") + "\n***** DEBUG LOG ENABLED *****", consoleCss_info);
}

//event.getModifierState("CapsLock")