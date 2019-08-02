// ==UserScript==
// @name         mitoco Support
// @namespace    https://github.com/leeTM3/
// @version      0.5
// @description  mitocoに機能追加
// @author       Lee™
// @match        https://terrasky.lightning.force.com/TSMNTBS/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const PINLIST_NAME = "ms_pinList";
    const BLOCKLIST_NAME = "ms_blockList";
    const WEEKEND_BLOCK_NAME = "ms_weekend_block";

    var blockList = (localStorage.getItem(BLOCKLIST_NAME) || '').split(",");
    var pinList = (localStorage.getItem(PINLIST_NAME) || '').split(",");
    var isWeekend_block = localStorage.getItem(WEEKEND_BLOCK_NAME)==null?true:localStorage.getItem(WEEKEND_BLOCK_NAME).toLowerCase() === "true";

    if(isWeekend_block){
        blockWeekend();
    }
    glowBBSUnread();


    //改変処理の挿入は利用できるイベントが無いのでMutationObserverで。
    var option = { childList: true, subtree: true};
    var observer = new MutationObserver(mutationFilter);
    observer.observe(document.body, option);
    var init = false;

    initSettingDialog();

    function mutationFilter(mutation){
        mutation.forEach(function(m) {
            var nodes = m.addedNodes;
            var tgt = m.target;
//            console.log(m);
            for(var i=0; i<nodes.length; i++) {
//                console.log(nodes[i]);
//                if(nodes[i].querySelectorAll && nodes[i].querySelectorAll(".onHeader").length > 0){
//                }
                if (nodes[i].classList && nodes[i].classList.contains("TSMNTCLBCOM_GroupListItem")) {
                    //トーク関連の処理
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

    function initSettingDialog(){
        //設定ダイアログの作成
        var ms_favDialog = document.createElement ('dialog');
        ms_favDialog.innerHTML = `
<h2>制御したいルーム名をカンマ区切りで入力してください</h2>
<br>
<form method="dialog">
<label>トークピン留め: </label><br>
<input type="text" id="${PINLIST_NAME}" value="${pinList}"/><br>
<label>トーク非表示: </label><br>
<input type="text" id="${BLOCKLIST_NAME}" value="${blockList}"/><br>
<label>カレンダー週末非表示: </label><br>
<input type="checkbox" id="${WEEKEND_BLOCK_NAME}" ${isWeekend_block?"checked":""}/><br>
<menu>
<button value="cancel">Cancel</button>
<button value="save">Save</button>
</menu>
</form>`;

        ms_favDialog.addEventListener('close', function onClose() {
            if(ms_favDialog.returnValue==="save"){
                localStorage.setItem(PINLIST_NAME,document.getElementById(PINLIST_NAME).value);
                localStorage.setItem(BLOCKLIST_NAME,document.getElementById(BLOCKLIST_NAME).value);
                localStorage.setItem(WEEKEND_BLOCK_NAME,document.getElementById(WEEKEND_BLOCK_NAME).checked);
                location.reload();
            }
        });

        document.body.appendChild(ms_favDialog);

        var createRoomButton = document.querySelectorAll(".titleArea.appTitle");
        var tmpDiv= document.createElement ('span');
        tmpDiv.innerHTML= '<a href="#" style="font-size: 20px;margin-left: 10px;">🔧</a>';
        tmpDiv.onclick = function() {
             ms_favDialog.showModal();
            return false;
        };
        createRoomButton[0].appendChild(tmpDiv);
        init = true;
    }

    function blockWeekend(){
        GM_addStyle(`
.indexOfWeek-0 , .indexOfWeek-6 {
    display:none!important;
}
.TSMNTCLBCAL_Weekly2 .mainContent>dl>dd:nth-of-type(1),.TSMNTCLBCAL_Weekly2 .mainContent>dl>dd:last-child {
    display: none!important;
}
/*ダイアログ形式に戻す*/
.mitoco_base .tsModal2 {
    width: 95%!important;
/*    height: 95%!important;*/
    border-radius: 0.5em!important;
    border: 1px solid rgba(0, 0, 0, .2);
}
/*掲示板のポップアップのボタンを拡大*/
.mitoco_base .tsModal2 .tsModal__footer .tsBtn2{
    height: auto!important;
    padding: 8px 23px!important;
}
/*カレンダー予定ポップアップのボタンを拡大*/
.mitoco_base .TSMNTCLBCAL_Popover .tsBtn2{
    height: auto!important;
    padding: 8px 23px!important;
}
/*カレンダー詳細画面のボタンを拡大*/
.mitoco_base .TSMNTCLBCAL_EventEditPanel .tsBtn2{
    height: auto!important;
    padding: 8px 23px!important;
}
/*掲示板、タイトル文字を40から32に*/
.TSMNTCLBBBS_BaseDetailView .titleArea .title{
	font-size: 32px!important;
}
/*掲示板、タイトル部分をコンパクトに*/
.TSMNTCLBBBS_BaseDetailView .titleArea{
    min-height: 100px!important;
}
/*掲示板、公開日などをコンパクトに*/
.TSMNTCLBBBS_BaseDetailView .statusArea .bottom .stBottomItem{
    flex-direction: row!important;
}
.TSMNTCLBBBS_BaseDetailView .statusArea .bottom .stBottomItem .date{
    margin-left: auto!important;
}

`);
    }
    function glowBBSUnread(){
        GM_addStyle(`
@keyframes glowing {
  0% { box-shadow: 0px 0px 1px 3px #FFFF00; }
  40% { box-shadow: 0px 0px 10px 3px #FF0000; }
  60% { box-shadow: 0px 0px 10px 3px #FF0000; }
  100% { box-shadow: 0px 0px 1px 3pxx #FFFF00; }
}
.TSMNTCLBBBS_Portal .indicator.colorSystem.background {
  animation: glowing 1500ms infinite;
}
`);
    }
})();
