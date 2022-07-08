// ==UserScript==
// @name         MenuLounge Addons
// @namespace    http://tampermonkey.net/
// @version      1.0
// @updateURL    https://github.com/cbn-falias/browser-scripts/raw/main/menuelounge/MenuLounge%20Addons.user.js
// @downloadURL  https://github.com/cbn-falias/browser-scripts/raw/main/menuelounge/MenuLounge%20Addons.user.js
// @description  omnomnom
// @author       FAL
// @match        https://menuelounge.com/*
// @icon         https://www.google.com/s2/favicons?domain=menuelounge.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    copyAvailableProductsButtonToHeader();
    showTodaysOrderInNavBar();
    resizeProductListing();
    appendNavToProductListing();
    hideAdBanner();
})();

function hideAdBanner() {
    var bannerEl = document.querySelector('.top-advertisement-slot.advertisement-component');
    if(bannerEl) {
        bannerEl.style.display = 'none';
    }
}

function resizeProductListing() {
    var products = document.querySelector('.product__listing.product__grid');
    if(!products) {
        return;
    }

    products.childNodes.forEach(prodEl => {
        if(prodEl && prodEl.classList && prodEl.classList.contains('col-sm-3')) {
            prodEl.classList.add('col-sm-2');
            prodEl.classList.remove('col-sm-3');
        }
    });

    var pagination = document.querySelector('.pagination.hmm-pull-right-sm');
    if(pagination) {
        pagination.style.transformOrigin = 'right';
        pagination.style.transform = 'scale(1.3)';
    }
}

// when products are resized it might be misleading that the end of all products is reached
function appendNavToProductListing() {
    var pagination = document.querySelector('.pagination');
    var products = document.querySelector('.product__listing.product__grid');
    if(!pagination || !products) {
        return;
    }

    var rowIsFull = products.childElementCount % 6 === 0;

    if(!rowIsFull) {
        pagination = pagination.cloneNode(true);
        var newChild = products.appendChild(products.lastElementChild.cloneNode(false));
        newChild.style.display = 'flex';
        newChild.style.alignItems = 'center';
        newChild.style.justifyContent = 'center';
        newChild.appendChild(pagination);
    }
}

function showTodaysOrderInNavBar() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var monthStr = String(month).padStart(2, '0');

    $.ajax({
        async: true,
        url: "/my-account/orders/" + year + '-' + monthStr,
        method: "POST",
        dataType: 'json',
        success: function(response) {
            var result = {};
            try {
                result = JSON.parse(response);

                var day = new Date().getDate();
                var dateString = String(day).padStart(2, '0') + '.' + monthStr + '.' + year;
                //console.log(result);

                var todaysOrder = result.orders.filter(order => {
                    return order.dateAndShift.indexOf(dateString) === 0;
                });

                todaysOrder = todaysOrder.reduce((result, order) => {
                    var parts = order.product.split('</br>');
                    return result.concat(parts);
                }, []);
            } catch (e) {
            }

            var navLinksAcc = document.getElementsByClassName('nav__links--account')[0];
            var li = document.createElement('li');
            var aEl = document.createElement('a');
            li.appendChild(aEl);

            aEl.title = 'Go to your orders';
            aEl.href = '/de_AT/my-account/orders';
            if(todaysOrder && todaysOrder.length > 0) {
                aEl.textContent = 'Your order today: ' + todaysOrder.join(', ');
                didYouEarnIt(todaysOrder);
            } else {
                aEl.textContent = 'No order found for today (by CBN addon)';
            }
            aEl.style.paddingRight = '12px';
            navLinksAcc.appendChild(li);
        }
    })
}

function copyAvailableProductsButtonToHeader() {
    var btn = document.querySelector('.carousel__component-show-all-link');
    if(!btn || btn.length === 0) return;
    btn = btn.cloneNode(true);

    btn.classList.remove('btn');
    btn.style.padding = '10px 15px';

    var headerList = document.querySelector('.nav__links--products.js-offcanvas-links');
    headerList.insertBefore(btn, headerList.firstChild);
}

function didYouEarnIt(orders) {
    if(orders.length >= 0b11) { yesYouEarnedIt(); }
    else if(orders.length >= 0b10) { almostEarnedIt(); }
}

var almostEarned = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyI+PGcgd'+
'HJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtNzYuMzg1OCwtMTg4LjYzOSkiPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNjEyNTUzLC0wLjYwMzYzOCwwLjcwMTkwNCwwLjcxMjI3MSwtMjQwLjUzLDM4MC4xMykiPjx0ZXh0IHg9IjM2OS4yMzlweCIgeT0iNTQ2LjQ5OXB4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNDRweDtmaWxsOiNjZjAwMDA7Ij5BPC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjczMjc5MiwtMC40NTAxMjgsMC41MjM0MDUsMC44NTIwODQsLTEzNi44NzUsMjY2LjAwOSkiPjx0ZXh0IHg9IjQzMi40NzVweCIgeT0iNDgyLjI5NnB4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNDRweDtmaWxsOiNjZjAwMDA7Ij5QPC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjgxMjQyOCwtMC4yODIwNjYsMC4zMjc5ODQsMC45NDQ2ODMsLTQ5LjIzODYsMTY1LjgyOSkiPjx0ZXh0IHg9IjUwMi4xNDlweCIgeT0iNDM3LjMwMnB4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNDRweDtmaWxsOiNjZjAwMDA7Ij5QPC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjg1NTk2LC0wLjA4MzI2NDYsMC4wOTY4MTkzLDAuOTk1MzAyLDQ0LjEyMTcsNTAuMjE0NykiPjx0ZXh0IHg9IjU4MC4wOTNweCIgeT0iNDA3LjMwNnB4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNDRweDtmaWxsOiNjZjAwMDA7Ij5SPC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjg1MjE0LDAuMTE2MDA0LC0wLjEzNDg4OSwwLjk5MDg2MSwxNTIuNDE4LC03NC4wNjUpIj48dGV4dCB4PSI2NjkuNjU4cHgiIHk9IjM5NS44OTdweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTQ0cHg7ZmlsbDojY2YwMDAwOyI+TzwvdGV4dD48L2c+PG'+
'cgdHJhbnNmb3JtPSJtYXRyaXgoMC44MDIzLDAuMzA5NzAxLC0wLjM2MDExOCwwLjkzMjkwNywyOTguMzU3LC0yMDkuNzcyKSI+PHRleHQgeD0iNzY1Ljc0OHB4IiB5PSI0MDguMTEycHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPlY8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNzE0ODk0LDAuNDc4MDQ0LC0wLjU1NTg2NiwwLjgzMTI3Miw0ODMuMjEzLC0zMjkuNzA2KSI+PHRleHQgeD0iODQzLjc3MXB4IiB5PSI0MzYuNTI1cHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPkU8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNTkxMDY3LDAuNjI0NjkyLC0wLjcyNjM4NiwwLjY4NzI4Nyw3MjMuMjQ4LC00MjAuNzE4KSI+PHRleHQgeD0iOTE0LjI1NHB4IiB5PSI0ODAuOTgycHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPkQ8L3RleHQ+PC9nPjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSwtMS4yMjQ2NWUtMTYsMS4yMjQ2NWUtMTYsLTEsMTI3MS4yNiwxMzg4LjY0KSI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMC42MTI1NTMsLTAuNjAzNjM4LDAuNzAxOTA0LDAuNzEyMjcxLC0yNDAuNTMsMzgwLjEzKSI+PHRleHQgeD0iMzY5LjIzOXB4IiB5PSI1NDYuNDk5cHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPkE8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNzMyNzkyLC0wLjQ1MDEyOCwwLjUyMzQwNSwwLjg1MjA4NCwtMTM2Ljg3NSwyNjYuMDA5KSI+PHRleHQgeD0iNDMyLjQ3NXB4IiB5PSI0ODIuMjk2cHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2Z'+
'pbGw6I2NmMDAwMDsiPlA8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODEyNDI4LC0wLjI4MjA2NiwwLjMyNzk4NCwwLjk0NDY4MywtNDkuMjM4NiwxNjUuODI5KSI+PHRleHQgeD0iNTAyLjE0OXB4IiB5PSI0MzcuMzAycHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPlA8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODU1OTYsLTAuMDgzMjY0NiwwLjA5NjgxOTMsMC45OTUzMDIsNDQuMTIxNyw1MC4yMTQ3KSI+PHRleHQgeD0iNTgwLjA5M3B4IiB5PSI0MDcuMzA2cHgiIHN0eWxlPSJmb250LWZhbWlseTonQXJpYWwtQm9sZE1UJywgJ0FyaWFsJywgc2Fucy1zZXJpZjtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjE0NHB4O2ZpbGw6I2NmMDAwMDsiPlI8L3RleHQ+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODUyMTQsMC4xMTYwMDQsLTAuMTM0ODg5LDAuOTkwODYxLDE1Mi40MTgsLTc0LjA2NSkiPjx0ZXh0IHg9IjY2OS42NThweCIgeT0iMzk1Ljg5N3B4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxNDRweDtmaWxsOiNjZjAwMDA7Ij5PPC90ZXh0PjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjgwMjMsMC4zMDk3MDEsLTAuMzYwMTE4LDAuOTMyOTA3LDI5OC4zNTcsLTIwOS43NzIpIj48dGV4dCB4PSI3NjUuNzQ4cHgiIHk9IjQwOC4xMTJweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTQ0cHg7ZmlsbDojY2YwMDAwOyI+VjwvdGV4dD48L2c+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMC43MTQ4OTQsMC40NzgwNDQsLTAuNTU1ODY2LDAuODMxMjcyLDQ4My4yMTMsLTMyOS43MDYpIj48dGV4dCB4PSI4NDMuNzcxcHgiIHk9IjQzNi41MjVweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTQ0cHg7ZmlsbDojY2YwMDAwOyI+RTwvdGV4dD48L2c+PGcgdHJhbnNmb3JtPSJtYXRyaXgo'+
'MC41OTEwNjcsMC42MjQ2OTIsLTAuNzI2Mzg2LDAuNjg3Mjg3LDcyMy4yNDgsLTQyMC43MTgpIj48dGV4dCB4PSI5MTQuMjU0cHgiIHk9IjQ4MC45ODJweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTQ0cHg7ZmlsbDojY2YwMDAwOyI+RDwvdGV4dD48L2c+PC9nPjxwYXRoIGQ9Ik02MDAuMTUzLDczLjUwOGMyOTEuMTMsLTAgNTI3LjQ5MiwyMzYuMzYxIDUyNy40OTIsNTI3LjQ5MmMtMCwyOTEuMTMxIC0yMzYuMzYyLDUyNy40OTIgLTUyNy40OTIsNTI3LjQ5MmMtMjkxLjEzMSwwIC01MjcuNDkyLC0yMzYuMzYxIC01MjcuNDkyLC01MjcuNDkyYy0wLC0yOTEuMTMxIDIzNi4zNjEsLTUyNy40OTIgNTI3LjQ5MiwtNTI3LjQ5MlptLTAsMTVjMjgyLjg1MiwtMCA1MTIuNDkyLDIyOS42NCA1MTIuNDkyLDUxMi40OTJjLTAsMjgyLjg1MiAtMjI5LjY0LDUxMi40OTIgLTUxMi40OTIsNTEyLjQ5MmMtMjgyLjg1MiwwIC01MTIuNDkyLC0yMjkuNjQgLTUxMi40OTIsLTUxMi40OTJjLTAsLTI4Mi44NTIgMjI5LjY0LC01MTIuNDkyIDUxMi40OTIsLTUxMi40OTJaIiBzdHlsZT0iZmlsbDojY2YwMDAwOyIvPjxwYXRoIGQ9Ik02MDAuMTUzLDI0MWMxOTguNjg5LC0wIDM2MCwxNjEuMzExIDM2MCwzNjBjLTAsMTk4LjY4OSAtMTYxLjMxMSwzNjAgLTM2MCwzNjBjLTE5OC42OSwtMCAtMzYwLC0xNjEuMzExIC0zNjAsLTM2MGMtMCwtMTk4LjY4OSAxNjEuMzEsLTM2MCAzNjAsLTM2MFptLTAsMTJjMTkyLjA2NiwtMCAzNDgsMTU1LjkzNCAzNDgsMzQ4Yy0wLDE5Mi4wNjYgLTE1NS45MzQsMzQ4IC0zNDgsMzQ4Yy0xOTIuMDY3LC0wIC0zNDgsLTE1NS45MzQgLTM0OCwtMzQ4Yy0wLC0xOTIuMDY2IDE1NS45MzMsLTM0OCAzNDgsLTM0OFoiIHN0eWxlPSJmaWxsOiNjZ'+
'jAwMDA7Ii8+PGcgaWQ9IkxheWVyLTEiIHNlcmlmOmlkPSJMYXllciAxIj48cGF0aCBpZD0icGF0aDQ4NDIiIGQ9Ik0yNDMuNTQ0LDQ1Mi4xODNsLTM0LjYyLC0xMS43NGwtMjkuMjk4LDIxLjg2NGwwLjQ2NywtMzYuNTU0bC0yOS44NDcsLTIxLjEwOGwzNC45MDksLTEwLjg1MWwxMC44NTEsLTM0LjkwOWwyMS4xMDgsMjkuODQ3bDM2LjU1NCwtMC40NjdsLTIxLjg2NCwyOS4yOThsMTEuNzQsMzQuNjJaIiBzdHlsZT0iZmlsbDojY2YwMDAwO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxwYXRoIGlkPSJwYXRoNDg0NCIgZD0iTTk1NS4zNTMsNDUyLjE4M2wzNC42MiwtMTEuNzRsMjkuMjk4LDIxLjg2NGwtMC40NjgsLTM2LjU1NGwyOS44NDcsLTIxLjEwOGwtMzQuOTA4LC0xMC44NTFsLTEwLjg1MiwtMzQuOTA5bC0yMS4xMDcsMjkuODQ3bC0zNi41NTQsLTAuNDY3bDIxLjg2NCwyOS4yOThsLTExLjc0LDM0LjYyWiIgc3R5bGU9ImZpbGw6I2NmMDAwMDtmaWxsLXJ1bGU6bm9uemVybzsiLz48cGF0aCBpZD0icGF0aDQ4NDYiIGQ9Ik0yNDMuNTQ0LDc1NC4wMTlsLTM0LjYyLDExLjc0bC0yOS4yOTgsLTIxLjg2M2wwLjQ2NywzNi41NTNsLTI5Ljg0NywyMS4xMDhsMzQuOTA5LDEwLjg1MWwxMC44NTEsMzQuOTA5bDIxLjEwOCwtMjkuODQ3bDM2LjU1NCwwLjQ2N2wtMjEuODY0LC0yOS4yOThsMTEuNzQsLTM0LjYyWiIgc3R5bGU9ImZpbGw6I2NmMDAwMDtmaWxsLXJ1bGU6bm9uemVybzsiLz48cGF0aCBpZD0icGF0aDQ4NDgiIGQ9Ik05NTUuMzUzLDc1NC4wMTlsMzQuNjIsMTEuNzRsMjkuMjk4LC0yMS44NjNsLTAuNDY4LDM2LjU1M2wyOS44NDcsMjEuMTA4bC0zNC45MDgsMTAuODUxbC0xMC44NTIsMzQuOTA5bC0yMS4xMDcsLTI5Ljg0N2wtMzYuNTU0LDAuNDY3bDIxLjg2NCwtMjkuMjk4bC0xMS43NCwtMzQuNjJaIiBzdHlsZT0iZmlsbDojY2YwMDAwO2ZpbG'+
'wtcnVsZTpub256ZXJvOyIvPjxwYXRoIGQ9Ik0xMTg5LjAxLDQ5OS4yNjJjMCwtMTIuMjA0IC05LjkwOCwtMjIuMTEzIC0yMi4xMTMsLTIyLjExM2wtMTEzMy43OSwwYy0xMi4yMDUsMCAtMjIuMTEzLDkuOTA5IC0yMi4xMTMsMjIuMTEzbC0wLDIwMS40NzVjLTAsMTIuMjA1IDkuOTA4LDIyLjExNCAyMi4xMTMsMjIuMTE0bDExMzMuNzksLTBjMTIuMjA1LC0wIDIyLjExMywtOS45MDkgMjIuMTEzLC0yMi4xMTRsMCwtMjAxLjQ3NVoiIHN0eWxlPSJmaWxsOiNjZjAwMDA7Ii8+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMC44NiwwLDAsMSwtNi45ODY0NiwwKSI+PHRleHQgeD0iNjUuMTM0cHgiIHk9IjY4OC4zNHB4IiBzdHlsZT0iZm9udC1mYW1pbHk6J0FyaWFsLUJvbGRNVCcsICdBcmlhbCcsIHNhbnMtc2VyaWY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToyMjJweDtmaWxsOiNmZmY7Ij5Hw5ZOTkVSKklOPC90ZXh0PjwvZz48L2c+PC9zdmc+';

function almostEarnedIt() {
    var m = document.createElement('img');
    m.style.position = 'absolute';
    m.style.left = '230px';
    m.style.zIndex = '10000';
    m.style.transform = 'rotate(-20deg)';
    m.height = 110;
    m.title = 'Almost earned it!';
    m.src = almostEarned;
    var acc = document.querySelector('.nav-my-account');
    if(acc) {
        acc.appendChild(m);
    }
}

var earned = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCA1MDIgNTAyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPjxwYXRoIGQ9Ik0xODkuMTI3LDEwOS43MTRsMTI5LjU2NywwbDExMy44OTQsLTEwOS43MTRsLTEyOS41NjgsMGwtMTEzLjg5MywxMDkuNzE0WiIgc3R5bGU9ImZpbGw6I2YxNTQzZjtmaWxsLXJ1bGU6bm9uemVybzsiLz48cGF0aCBkPSJNMzQyLjcyNywxNjguMjI5bC0xODMuOTAzLDBsLTAsLTgwLjQ1OGwxODMuOTAyLC0wbC0wLDgwLjQ1OGwwLjAwMSwwWm0tMTYzLjAwNSwtMjAuODk4bDE0Mi4xMDYsLTBsLTAsLTM4LjY2MWwtMTQyLjEwNiwtMGwtMCwzOC42NjFaIiBzdHlsZT0iZmlsbDojZjhiNjRjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxwYXRoIGQ9Ik0zMTguNjk0LDEwOS43MTRsLTEyOS41NjcsMGwtMTE0LjkzOSwtMTA5LjcxNGwxMzAuNjEyLDBsMTEzLjg5NCwxMDkuNzE0WiIgc3R5bGU9ImZpbGw6I2ZmNzA1ODtmaWxsLXJ1bGU6bm9uemVybzsiLz48Y2lyY2xlIGN4PSIyNTAuNzc2IiBjeT0iMzA4LjI0NSIgcj0iMTkzLjMwNiIgc3R5bGU9ImZpbGw6I2ZmZDE1YzsiLz48cGF0aCBkPSJNMjUwLjc3Niw0NTQuNTMxYy04MC40NTcsMCAtMTQ2LjI4NiwtNjUuODI5IC0xNDYuMjg2LC0xNDYuMjg2YzAsLTgwLjQ1NyA2NS44MjksLTE0Ni4yODYgMTQ2LjI4NiwtMTQ2LjI4NmM4MC40NTcsMCAxNDYuMjg2LDY1LjgyOSAxNDYuMjg2LDE0Ni4yODZjMCw4MC40NTcgLTY1LjgyOSwxNDYuMjg2IC0xNDYuMjg2LDE0Ni4yODZaIiBzdHlsZT0iZmlsbDojZjhiNjRjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxwYXRoIGQ9Ik0yNTAuNzc2LDE3Ni41ODhsMzAuMzAyLDkxLjk1MWw5Ny4xNzUsMGwtNzkuNDEyLDU3LjQ2OWwzMC4zMDIsOTEuOTUxbC03OC4zNjcsLTU3LjQ2OWwtNzguMzY4LDU3LjQ2OWwzMC4zMDIsLTkxLjk1MWwtNzkuNDEyLC01Ny40NjlsOTcuMTc1LDBsMzAuMzAzLC05MS45NTFaIiBzdHlsZT0iZmlsbDojZmZkMTVjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODA0Mjc0LDAsMCwwLjgwNDI3NCwyMC4wNTYxLDMwLjg2NDEpIj48dGV4dCB4PSIxNjUuOTU5cHgiIHk9IjMxNC43MTZweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTA0LjQ1OHB4OyI+Q2hlZjwvdGV4dD48dGV4dCB4PSIxMzkuNzE3cHgiIHk9IjQyMi41OTJweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTA0LjQ1OHB4OyI+RXNzZXI8L3RleHQ+PC9nPjwvc3ZnPg==';
function yesYouEarnedIt() {
    var m = document.createElement('img');
    m.style.position = 'absolute';
    m.style.left = '230px';
    m.style.zIndex = '10000';
    m.height = 105;
    m.title = 'You earned it!';
    m.src = earned;
    var acc = document.querySelector('.nav-my-account');
    if(acc) {
        acc.appendChild(m);
    }
}
