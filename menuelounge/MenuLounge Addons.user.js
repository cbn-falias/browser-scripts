// ==UserScript==
// @name         MenuLounge Addons
// @namespace    http://tampermonkey.net/
// @version      0.2
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
})();

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

            todaysOrder = todaysOrder.map(order => order.product);

            var navLinksAcc = document.getElementsByClassName('nav__links--account')[0];
            var li = document.createElement('li');
            var aEl = document.createElement('a');
            li.appendChild(aEl);

            aEl.title = 'Go to your orders';
            aEl.href = '/de_AT/my-account/orders';
            if(todaysOrder && todaysOrder.length > 0) {
                aEl.textContent = 'Your order today: ' + todaysOrder.join(', ').replace('</br>', ', ');
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
