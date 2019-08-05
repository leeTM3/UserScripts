// ==UserScript==
// @name         LEXAutoSwitcher
// @namespace    https://github.com/leeTM3/
// @version      0.1
// @description  自動的にLEXからClassicに切り替える
// @author       Lee™
// @match        https://terrasky.lightning.force.com/lightning/page/home
// ==/UserScript==

(function() {
    'use strict';
    document.location = 'https://terrasky.lightning.force.com/ltng/switcher?destination=classic&referrer=%2Flightning%2Fpage%2Fhome';
})();
