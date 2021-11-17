// ==UserScript==
// @name         MenuLounge Addons
// @namespace    http://tampermonkey.net/
// @version      0.5
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
}

function showTodaysOrderInNavBar() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;

    $.ajax({
        async: true,
        url: "/my-account/orders/" + year + '-' + month,
        method: "POST",
        dataType: 'json',
        success: function(response) {
            var result = JSON.parse(response);
            var day = new Date().getDate();
            var dateString = String(day).padStart(2, '0') + '.' + String(month).padStart(2, '0') + '.' + year;
            //console.log(result);

            var todaysOrder = result.orders.filter(order => {
                return order.dateAndShift.indexOf(dateString) === 0;
            });

            todaysOrder = todaysOrder.reduce((result, order) => {
                var parts = order.product.split('</br>');
                return result.concat(parts);
            }, []);

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
}

var earned = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCA1MDIgNTAyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPjxwYXRoIGQ9Ik0xODkuMTI3LDEwOS43MTRsMTI5LjU2NywwbDExMy44OTQsLTEwOS43MTRsLTEyOS41NjgsMGwtMTEzLjg5MywxMDkuNzE0WiIgc3R5bGU9ImZpbGw6I2YxNTQzZjtmaWxsLXJ1bGU6bm9uemVybzsiLz48cGF0aCBkPSJNMzQyLjcyNywxNjguMjI5bC0xODMuOTAzLDBsLTAsLTgwLjQ1OGwxODMuOTAyLC0wbC0wLDgwLjQ1OGwwLjAwMSwwWm0tMTYzLjAwNSwtMjAuODk4bDE0Mi4xMDYsLTBsLTAsLTM4LjY2MWwtMTQyLjEwNiwtMGwtMCwzOC42NjFaIiBzdHlsZT0iZmlsbDojZjhiNjRjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxwYXRoIGQ9Ik0zMTguNjk0LDEwOS43MTRsLTEyOS41NjcsMGwtMTE0LjkzOSwtMTA5LjcxNGwxMzAuNjEyLDBsMTEzLjg5NCwxMDkuNzE0WiIgc3R5bGU9ImZpbGw6I2ZmNzA1ODtmaWxsLXJ1bGU6bm9uemVybzsiLz48Y2lyY2xlIGN4PSIyNTAuNzc2IiBjeT0iMzA4LjI0NSIgcj0iMTkzLjMwNiIgc3R5bGU9ImZpbGw6I2ZmZDE1YzsiLz48cGF0aCBkPSJNMjUwLjc3Niw0NTQuNTMxYy04MC40NTcsMCAtMTQ2LjI4NiwtNjUuODI5IC0xNDYuMjg2LC0xNDYuMjg2YzAsLTgwLjQ1NyA2NS44MjksLTE0Ni4yODYgMTQ2LjI4NiwtMTQ2LjI4NmM4MC40NTcsMCAxNDYuMjg2LDY1LjgyOSAxNDYuMjg2LDE0Ni4yODZjMCw4MC40NTcgLTY1LjgyOSwxNDYuMjg2IC0xNDYuMjg2LDE0Ni4yODZaIiBzdHlsZT0iZmlsbDojZjhiNjRjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxwYXRoIGQ9Ik0yNTAuNzc2LDE3Ni41ODhsMzAuMzAyLDkxLjk1MWw5Ny4xNzUsMGwtNzkuNDEyLDU3LjQ2OWwzMC4zMDIsOTEuOTUxbC03OC4zNjcsLTU3LjQ2OWwtNzguMzY4LDU3LjQ2OWwzMC4zMDIsLTkxLjk1MWwtNzkuNDEyLC01Ny40NjlsOTcuMTc1LDBsMzAuMzAzLC05MS45NTFaIiBzdHlsZT0iZmlsbDojZmZkMTVjO2ZpbGwtcnVsZTpub256ZXJvOyIvPjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODA0Mjc0LDAsMCwwLjgwNDI3NCwyMC4wNTYxLDMwLjg2NDEpIj48dGV4dCB4PSIxNjUuOTU5cHgiIHk9IjMxNC43MTZweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTA0LjQ1OHB4OyI+Q2hlZjwvdGV4dD48dGV4dCB4PSIxMzkuNzE3cHgiIHk9IjQyMi41OTJweCIgc3R5bGU9ImZvbnQtZmFtaWx5OidBcmlhbC1Cb2xkTVQnLCAnQXJpYWwnLCBzYW5zLXNlcmlmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MTA0LjQ1OHB4OyI+RXNzZXI8L3RleHQ+PC9nPjwvc3ZnPg==';
function yesYouEarnedIt() {
    var m = document.createElement('img');
    m.style.position = 'absolute';
    m.style.left = '200px';
    m.style.zIndex = '10000';
    m.height = 80;
    m.title = 'You earned it!';
    m.src = earned;
    var acc = document.querySelector('.nav-my-account');
    if(acc) {
        acc.appendChild(m);
    }
}
