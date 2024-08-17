var currentTab;
var tabCount = 0;
var active = false;

function setup() {
    var openPages = localStorage.getItem("openPages");
    openPages = parseInt(openPages);

    if (!openPages) {
        openPages = 0;
        active = true;
    } else {
        var blocker = document.querySelector("#blocker");
        blocker.style.opacity = 1;
        blocker.style.pointerEvents = "auto";
    }

    openPages += 1;

    localStorage.setItem("openPages", openPages)

    currentTabStored = parseInt(localStorage.getItem("currentTab"));
    tabCountStored = parseInt(localStorage.getItem("tabCount"));

    if (!tabCountStored) {
        tabCountStored = 1;
    }

    for (i = 0; i < tabCountStored; i++) {
        createTab();
    }

    tabCount = tabCountStored;
    currentTab = currentTabStored;

    if (currentTab > tabCount || !currentTab) {
        currentTab = 1;
    }

    select(currentTab);
    load(currentTab);
    
    localStorage.setItem("currentTab", currentTab);

    createTab(icon="plus");
    createTab(icon="trash");
    createTab(icon="download");
}

function save(tab) {
    localStorage.setItem("text" + String(tab), document.getElementById("text").value);
}

function load(tab) {
    var text_field = document.querySelector("#text");
    
    if (localStorage.getItem("text" + String(tab)) != null) {
        text_field.value = localStorage.getItem("text" + String(tab));
        text_field.selectionEnd = 0;
    } else {
        text_field.value = "";
    }

    var blocker = document.querySelector("#blocker");

    if (blocker.style.opacity == 0) {
        text_field.focus();
    }
}

function unselect() {
    var selectedTab = document.querySelector(".selected");

    if (selectedTab) {
        selectedTab.classList.remove("selected");
    }
}

function select(tab) {
    unselect();

    var target = document.querySelector("#tab" + String(tab))
    
    if (!target.classList.contains("selected")) {
        target.classList.add("selected");
    }
}

function createTab(icon=null) {
    if (icon) {
        var end = document.querySelector("#toolend");
    } else {
        if (currentTab) {
            save(currentTab);
        }
        
        tabCount += 1;
        currentTab = tabCount;

        var end = document.querySelector("#contentend");
    }

    var newTab = document.createElement("button");
    newTab.classList.add("tab");
    newTab.id = "tab" + String(currentTab);
    newTab.setAttribute("onclick", "switchTab(" + String(currentTab) + ")");

    if (icon) {
        newTab.classList.add(icon);

        if (icon == "plus") {
            newTab.setAttribute("onclick", "createTab()");
        } else if (icon == "trash") {
            newTab.setAttribute("onclick", "destroyTab()");
        } else if (icon == "download") {
            newTab.setAttribute("onclick", "download()");
        }
    } else {
        newTab.classList.add("content");
        newTab.innerHTML = String(currentTab);
    }

    end.before(newTab);

    if (!icon) {
        select(currentTab);
        load(currentTab);

        newTab.parentNode.scrollTop = newTab.parentNode.scrollHeight;

        localStorage.setItem("currentTab", currentTab);
        localStorage.setItem("tabCount", tabCount);
    }
}

function destroyTab() {
    var result = confirm("Delete tab " + String(currentTab) + "?");

    if (tabCount > 1 && result) {
        if (currentTab < tabCount) {
            localStorage.setItem("text" + String(currentTab), localStorage.getItem("text" + String(currentTab + 1)));
            localStorage.removeItem("text" + String(currentTab + 1));
        } else {
            localStorage.removeItem("text" + String(currentTab));
        }

        var selected = document.querySelector(".selected");
        selected.remove();

        tabCount -= 1;
        localStorage.setItem("tabCount", tabCount);

        if (currentTab > tabCount) {
            currentTab = tabCount;
        }

        var tabs = document.getElementsByClassName("content");

        for (i = 0; i < tabs.length; i++) {
            var n = parseInt(tabs[i].innerHTML);

            if (n > currentTab) {
                n -= 1;
                tabs[i].innerHTML = String(n);
                tabs[i].id = "tab" + String(n);
                tabs[i].setAttribute("onclick", "switchTab(" + String(n) + ")");
            }
        }

        select(currentTab);
        load(currentTab);
    } else if (result) {
        localStorage.removeItem("text" + String(currentTab));
        load(currentTab);
    }
}

function switchTab(n) {
    save(currentTab);

    if (currentTab != n) {
        currentTab = n;
    }

    select(currentTab);
    load(currentTab);

    localStorage.setItem("currentTab", currentTab);
}

async function download(event) {
    save(currentTab);

    var text = localStorage.getItem("text" + String(currentTab));
    text = text.replace(/\n/g, "\r\n");
    var blob = new Blob([text], {type: "text/plain; charset=utf-8"});

    if (window.showSaveFilePicker) {
        save(currentTab);

        var options = {
            types: [
                {
                    description: "Text file",
                    accept: {"text/plain": [".txt"]},
                }
            ],
            suggestedName: "tab-" + String(currentTab) + ".txt",
            excludeAcceptAllOption: true
        };
        
        const handle = await showSaveFilePicker(options);
        const writable = await handle.createWritable();

        await writable.write(blob);
        writable.close();
    } else {
        var anchor = document.createElement("a");
        anchor.download = "tab-" + String(currentTab) + ".txt";
        anchor.href = window.URL.createObjectURL(blob);
        anchor.target = "_blank";
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        alert("The File System Access API is not supported on your browser. Saving as tab-" + String(currentTab) + ".txt...");
    }
}

window.onunload = function() {
    save(currentTab);

    var openPages = localStorage.getItem("openPages");
    openPages = parseInt(openPages);

    if (!openPages) {
        openPages = 0;
    } else {
        openPages -= 1;

        if (openPages < 0) {
            openPages = 0;
        }
    }

    localStorage.setItem("openPages", openPages);
}

setup();
load(currentTab);