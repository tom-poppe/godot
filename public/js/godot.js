/*
    Make background ajax call
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
        (error) => {
            console.warn("Failed to fetch form on " + formAction);
            console.error(error);
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
        document.getElementById("card-top").style.height = "50%";
        document.getElementById("card-bottom").style.display = "block";
        
        setInnerHtml(document.getElementById("content-bottom"), data);

        document.getElementById("content-bottom").style.overflowY = "auto";
    });
}