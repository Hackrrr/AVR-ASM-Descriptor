let input, output, toastEl, toastTimeoutID, loadedFileName = "", formatter, commentRules;

//TODO: "Používáme sušenky" alert :)
//TODO: Migrate to Local Storage API? (a tedy "ukládáme soubory" alert :) )
//TODO: Save settings register komentátorů
temp = getCookie("formatter");
formatter = new Formatter(temp == "" ? {} : JSON.parse(temp));
temp = getCookie("commentRules"); //TODO: Fix error on added instrucion if selected was saved...
commentRules = new CommentRules(temp == "" ? {} : JSON.parse(temp));
temp = getCookie("intelligentCommenters");
if (temp != "")
    for (let inteligentCommenter of intelligentCommenters)
        if (inteligentCommenter.name in temp)
            inteligentCommenter.settings = temp[inteligentCommenter.name];
delete temp;
for (let instruction of Object.keys(instructionData)) {
    if (!(instruction in commentRules.selectedCommenters)) {
        commentRules.selectedCommenters[instruction] = getRandom(0, instructionData[instruction].length - 1);
    }
}

window.onload = () => {
    input = document.getElementById("input");
    output = document.getElementById("output");
    toastEl = document.getElementById("toast");
}

function makeItHappen() {
    let result;
    try {
        result = commentCode(input.value, formatter, commentRules);
    } catch (e) {
        if ("stack" in e)
            result = e.stack;
        else
            result = e.toString();
        console.error(e);
    }
    if (result.trim() == "") result = "";
    output.value = result;
}

async function keyboardHandle(e) {
    if (e.ctrlKey) {
        if (e.keyCode == 13) {
            makeItHappen();
        }  else if (e.keyCode == 32) {
            let promise = navigator?.clipboard?.writeText(output.value);
            if (promise == null) {
                createToast("Nekompatibilný prohlížeč - Nelze zkopírovat výsledek (Objekt 'navigator' neexistuje nebo neobsahuje vlastnost 'clipboard')");
                return;
            }
            await promise;
            createToast("Výsledek byl zkopírován");
        } else if (e.keyCode == 83) {
            let canSave = false;
            try {
                canSave = !!new Blob;
            } catch {}
            if (canSave) {
                e.preventDefault();
                saveAs(new Blob([output.value], {type: "text/plain;charset=utf-8"}), loadedFileName);
            } else {
                createToast("Nekompatibilný prohlížeč - Nelze uložit soubor (Třída Blob neexistuje)");
            }
        }
    }
}
function drop(e) { // Dropujeme do Tilted boyz POGGERS
    e.preventDefault();
    // .getData() z Drop and Drag Web API nefunguje... Možná funguje jen pro věci v rámci aplikace? (tedy ne pro soubory...)
    let file = e.dataTransfer.files[0];
    if (!file || !("text" in file)) return;
    input.value = "Načítání ...";
    input.readOnly = true;
    file.text().then((x) => {
        loadedFileName = file.name;
        input.value = x;
        input.readOnly = false;
        createToast(`Soubor '${file.name}' načten`);
        makeItHappen();
    });
}
function paste(e) {
    if (document.activeElement != document.body) return;
    e.preventDefault()
    input.value = e.clipboardData.getData("text");
    input.focus();
}

function saveSettings() {
    setCookie("formatter", JSON.stringify(formatter), 60);
    setCookie("commentRules", JSON.stringify(commentRules), 60);
    let intelligentCommentersSettings = {};
    for (let intelligentCommenter of intelligentCommenters)
        intelligentCommentersSettings[intelligentCommenter.name] = intelligentCommenter.settings;
    setCookie("intelligentCommenters", JSON.stringify(intelligentCommentersSettings) ,60);
    createToast("Nastavení uloženo");
}

function createToast(str, timeout = 1500) {
    toastEl.innerHTML = str;
    toastEl.style.opacity = 1;
    if (timeout)
        toastTimeoutID = setTimeout(killToast, timeout);
}
function killToast() {
    clearTimeout(toastTimeoutID);
    toastTimeoutID = null;
    toastEl.style.opacity = 0;
}