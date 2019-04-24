// ==UserScript==
// @name         mitoco Talk Support
// @namespace    https://github.com/leeTM3/
// @version      0.1
// @description  MITOCOのトークに機能追加
// @author       Lee™
// @match        https://terrasky.lightning.force.com/TSMNTBS/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const pinList_name = "ms_pinList";
    const blockList_name = "ms_blockList";

    var blockList = (localStorage.getItem(blockList_name) || '').split(",");
    var pinList = (localStorage.getItem(pinList_name) || '').split(",");

    //改変処理の挿入は利用できるイベントが無いのでMutationObserverで。
    //パフォーマンスを懸念してたが、意外と20回弱しかコールされていない
    var option = { childList: true, subtree: true};
    var observer = new MutationObserver(roomFilter);
    observer.observe(document.body, option);
    var init = false;

    //設定ダイアログの作成
    var ms_favDialog = document.createElement ('dialog');
    ms_favDialog.innerHTML = `
  <h2>制御したいルーム名をカンマ区切りで入力してください</h2>
  <form method="dialog">
      <label for="name">ピン留め: </label><br>
      <input type="name" id="${pinList_name}" value="${pinList}"/><br>
      <label for="pwd">非表示: </label><br>
      <input type="text" id="${blockList_name}" value="${blockList}"/><br>
    <menu>
      <button value="cancel">Cancel</button>
      <button value="save">Save</button>
    </menu>
  </form>`;
    ms_favDialog.addEventListener('close', function onClose() {
        if(ms_favDialog.returnValue==="save"){
            localStorage.setItem(pinList_name,document.getElementById(pinList_name).value);
            localStorage.setItem(blockList_name,document.getElementById(blockList_name).value);
            location.reload();
        }
    });

    document.body.appendChild(ms_favDialog);
    window.ms_favDialog=ms_favDialog;

    function roomFilter(mutation){
        mutation.forEach(function(m) {
            var nodes = m.addedNodes;
            var tgt = m.target;
            for(var i=0; i<nodes.length; i++) {
                if (nodes[i].classList && nodes[i].classList.contains("TSMNTCLBCOM_GroupListItem")) {
                    if(!init){
                        //設定ダイアログのIDを設置
                        var createRoomButton = document.querySelectorAll(".roomList .listAddButton");
                        var tmpDiv= document.createElement ('span');
                        tmpDiv.innerHTML= '<a href="#" style="font-size: 20px;margin-left: 10px;">🔧</a>';
                        tmpDiv.onclick = function() { openSettingDialog(); return false};
                        createRoomButton[0].appendChild(tmpDiv);
                        init = true;
                    }
                    blockRooms(nodes[i]);
                    pinRoooms(nodes[i]);
                }
            }
        });
    }

    function blockRooms(elm){
        if(blockList.indexOf(elm.innerText) >= 0){
            elm.style.display = "none";
        }
    }

    function pinRoooms(elm){
        if(pinList.indexOf(elm.innerText) >= 0){
            //無限ループにならないようobserverを一時停止
            observer.disconnect();
            elm.parentElement.insertBefore(elm,elm.parentElement.firstElementChild);
            var tmpDiv= document.createElement ('div');
            tmpDiv.textContent= "📌";
            elm.appendChild(tmpDiv);
            observer.observe(document.body, option);
        }
    }
    function openSettingDialog(){
        if (typeof ms_favDialog.showModal === "function") {
            ms_favDialog.showModal();
        } else {
            alert("The dialog API is not supported by this browser");
        }
    }
})();