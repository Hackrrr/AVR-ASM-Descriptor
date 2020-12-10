let input, output, toastEl, loadedFileName = "", formater, selected;

temp = getCookie("formater");
formater = new Formater(temp == "" ? {} : JSON.parse(temp));
temp = getCookie("selected");
selected = temp == "" ? {} : JSON.parse(temp);
delete temp;
for (let instruction of Object.keys(instructionData)) {
    if (!(instruction in selected)) {
        selected[instruction] = getRandom(0, instructionData[instruction].length - 1);
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
        result = addComments(input.value, formater, selected);
    } catch (e) {
        if ("stack" in e)
            result = e.stack;
        else
            result = e.toString();
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
                toast("Nekompatibilný prohlížeč - Nelze zkopírovat výsledek (Objekt 'navigator' neexistuje nebo neobsahuje 'clipboard')");
                return;
            }
            await promise;
            toast("Výsledek byl zkopírován");
        } else if (e.keyCode == 83) {
            let canSave = false;
            try {
                canSave = !!new Blob;
            } catch {}
            if (canSave) {
                e.preventDefault();
                saveAs(new Blob([output.value], {type: "text/plain;charset=utf-8"}), loadedFileName);
            } else {
                toast("Nekompatibilný prohlížeč - Nelze uložit soubor (Třída Blob neexistuje)");
            }
        }
    }
}
function drop(e) { // Dropujeme do Tilted boyz POGGERS
    e.preventDefault();
    // .getData() z Drop and Drag Web API nefunguje... Možná funguje jen pro věci v rámci aplikace? (tedy ne pro soubory...)
    input.value = "Načítání ...";
    input.readOnly = true;
    let file = e.dataTransfer.files[0];
    file.text().then((x) => {
        loadedFileName = file.name;
        input.value = x;
        input.readOnly = false;
        toast(`Soubor '${file.name}' načten`);
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
    setCookie("formater", JSON.stringify(formater), 60);
    setCookie("selected", JSON.stringify(selected), 60);
    toast("Nastavení uloženo");
}

function toast(str) {
    toastEl.innerHTML = str;
    toastEl.style.opacity = 1;
    setTimeout(() => {
        toastEl.style.opacity = 0;
    }, 1500);
}