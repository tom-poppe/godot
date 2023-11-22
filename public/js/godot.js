/*
 *  dynamically load modal
 */

function loadModal(modal, url)
{
    fetch(url)
        .then(function(response) {
            return response.text();
        })
        .then(function(data) {
            setInnerHTML(document.getElementById(modal).querySelector(".modal-content"), data);
        });
}

/*
 *  Run dynamically loaded javascript
 */

function setInnerHTML(elm, html)
{
    elm.innerHTML = html;
    
    Array.from(elm.querySelectorAll("script"))
        .forEach( oldScriptEl => {
            const newScriptEl = document.createElement("script");
        
            Array.from(oldScriptEl.attributes).forEach( attr => {
                newScriptEl.setAttribute(attr.name, attr.value) 
            });
        
            const scriptText = document.createTextNode(oldScriptEl.innerHTML);
            newScriptEl.appendChild(scriptText);
        
            oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
        });
}

/*
 *  Functions on focus
 */

function autoFocusAndGoToEnd(element, event, field)
{
    document.getElementById(element).addEventListener(event, function () {
        area = document.getElementById(field);
        
        autoFocus(area);
        goToEnd(area);
    });
}

function autoFocus(area)
{
    area.focus();
}

function goToEnd(area)
{
    area.setSelectionRange(area.value.length,area.value.length);
}

/*
 *  Functions on autosave
 */

var autoSaveTimer = null;

function initAutoSave(element, icon)
{
    element.addEventListener("input", () => { prepareAutosave(element, icon) });
    element.addEventListener("submit", cancelAutosave);
}

function cancelAutosave()
{
    clearTimeout(autoSaveTimer);
}

function prepareAutosave(element, icon)
{
    setSyncStatusGui(icon, false);
    cancelAutosave();
    
    autoSaveTimer = setTimeout(() => { commitAutoSave(element, icon) }, 500);
}

async function commitAutoSave(element, icon)
{
    var formMethod = element.getAttribute("method");
    var formAction = element.getAttribute("action");
    var formData   = new FormData(element);

    response = await fetch (
       formAction, {
            method: formMethod,
            body: formData
        }
    ).catch(
        (transportError) => {
            console.warn("Failed to fetch form on " + formAction);
            console.error(transportError);
        }
    );

    if (response.ok) {
        setSyncStatusGui(icon, true);       
    }
}

function setSyncStatusGui(icon, state)
{
    if (state) {
        removeClass(icon, "bi-arrow-repeat");
        removeClass(icon, "text-danger");
        addClass(icon, "bi-cloud-check");
        addClass(icon, "text-success");
    } else {
        removeClass(icon, "bi-cloud-check");
        removeClass(icon, "text-success");
        addClass(icon, "bi-arrow-repeat");
        addClass(icon, "text-danger");
    }
}

function removeClass(element, className)
{
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
}

function addClass(element, className)
{
    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

/*
 *  Table functions
 */

function activateTable(tableName)
{
    document.querySelectorAll("#" + tableName + " tr").forEach(function (item) {
        item.addEventListener('click', function(itemClicked) {
            // Remove all active rows
            document.querySelectorAll("#" + tableName + " tr.active").forEach(function (element) {
                removeClass(element, "active");
            });

            // Set new active row
            row = itemClicked.target.closest("tr");
            addClass(row, "active");

            // Load view
            id = row.getAttribute("data-id")

            loadNote(id);
        });
    });
}

function loadNote(id)
{
    console.log(id);

    fetch("/note/" + id)
        .then(function(response) {
            return response.text();
        })
        .then(function(data) {
            setInnerHTML(document.getElementById("noteView"), data);
        });
}