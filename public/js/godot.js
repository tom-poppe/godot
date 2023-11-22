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

function removeClass(icon, className)
{
    if (icon.classList.contains(className)) {
        icon.classList.remove(className);
    }
}

function addClass(icon, className)
{
    if (!icon.classList.contains(className)) {
        icon.classList.add(className);
    }
}