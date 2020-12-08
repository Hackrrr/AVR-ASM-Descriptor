let input, output, loadedFileName = "";
window.onload = () => {
    input = document.getElementById("input");
    output = document.getElementById("output");
}

function makeItHappen() {
    let result;
    try {
        result = addComments(input.value);
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
            await navigator?.clipboard?.writeText(output.value);
        } else if (e.keyCode == 83) {
            let canSave = false;
            try {
                canSave = !!new Blob;
            } catch (e) {}
            if (canSave) {
                e.preventDefault();
                saveAs(new Blob([output.value], {type: "text/plain;charset=utf-8"}), loadedFileName);
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
        makeItHappen();
    });
}
function paste(e) {
    if (document.activeElement != document.body) return;
    e.preventDefault()
    input.value = e.clipboardData.getData("text");
    input.focus();
}

//TODO: toast() a cally z keyboardHadnleru (možná i z makeItHappen)
//TODO: Format settings