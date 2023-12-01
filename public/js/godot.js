/*
*   Some global vars
*/

const SYNC_STATE_ERROR = { "bi-arrow-repeat": 0, "text-primary": 0, "bi-cloud-check": 0, "text-success": 0, "bi-exclamation-circle-fill": 1, "text-danger": 1 };
const SYNC_STATE_OK    = { "bi-arrow-repeat": 0, "text-primary": 0, "bi-cloud-check": 1, "text-success": 1, "bi-exclamation-circle-fill": 0, "text-danger": 0 };
const SYNC_STATE_SYNC  = { "bi-arrow-repeat": 1, "text-primary": 1, "bi-cloud-check": 0, "text-success": 0, "bi-exclamation-circle-fill": 0, "text-danger": 0 };

/*
 *   Make background ajax call
 */

function loadUrl(url, callback)
{
    return fetch(url)
        .then(response => response.text())
        .catch(error => { console.log(error); });
}

/*
 *  custome to run dynamically loaded javascript
 */

function setInnerHtml(elm, html)
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
    setSyncStatusGui(icon, SYNC_STATE_SYNC);
    cancelAutosave();
    
    autoSaveTimer = setTimeout(() => { commitAutoSave(element, icon) }, 500);
}

function commitAutoSave(element, icon)
{
    var formMethod = element.getAttribute("method");
    var formAction = element.getAttribute("action");
    var formData   = new FormData(element);

    fetch (
       formAction, {
            method: formMethod,
            body: formData
        })
    .then(response => response.text())
    .then(phpChecksum => { 
        jsChecksum = md5(formData.values().next().value.replace(/\s+/g,''));
        
        try {
            if (phpChecksum === jsChecksum) {
                setSyncStatusGui(icon, SYNC_STATE_OK);
            } else {
                setSyncStatusGui(icon, SYNC_STATE_ERROR); 
            }
            
        } catch(error) {
            console.log(error);
            setSyncStatusGui(icon, SYNC_STATE_ERROR); 
        }
    })
    .catch(error => {
        console.log(error);
        setSyncStatusGui(icon, SYNC_STATE_ERROR); 
    });
}

function setSyncStatusGui(icon, classConfig)
{
    for (className in classConfig) {
        if (classConfig[className]) {
            addClass(icon, className);
        } else {
            removeClass(icon, className);        
        }
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
    document.querySelectorAll("#" + tableName + " tr.data-row").forEach(function (item) {
        item.addEventListener('click', function(itemClicked) {
            // Remove all active rows if any
            document.querySelectorAll("#" + tableName + " tr.active").forEach(function (element) {
                removeClass(element, "active");
            });

            // Set new active row
            row = itemClicked.target.closest("tr");
            addClass(row, "active");

            // Shrink table height
            
            
            // Load row into view
            row.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center'
            });
            
            // Load view
            url = row.getAttribute("data-show")

            loadShowPanel(url);
        });
    });
}

function loadShowPanel(url)
{
    loadUrl(url).then(data => {
        document.getElementById('card-top').style.height = "50%";
        document.getElementById('card-bottom').style.display = "block";
        
        setInnerHtml(document.getElementById("content-bottom"), data);
    });
}