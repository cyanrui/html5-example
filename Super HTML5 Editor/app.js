/**
 * Created by admin on 2017/3/7.
 */
(function(){
    var SuperEditor = function () {
        var view,fileName,isDirty=false,unsavedMsg = '没有保存的内容将会丢失，是否确认？',unsavedTitle='放弃修改';
        var markDirty = function () {
            isDirty = true;
        };
        var markClean= function () {
            isDirty=false;
        };
        var checkDirty= function () {
            if(isDirty){
                return unsavedMsg;
            }
        };
        window.onbeforeunload= checkDirty;//有兼容性，ie表现较好，谷歌不能设定显示文字

        var jump= function (e) {
            var hash = location.hash;
            if(hash.indexOf('/')>-1){
                var parts = hash.split('/');
                fileNameEl=document.getElementById('file_name');
                view = parts[0].substring(1)+'-view';
                fileName = parts[1];
                fileNameEl.innerHTML = fileName;
            }else{
                if(!isDirty||confirm(unsavedMsg,unsavedTitle)){
                    markClean();
                    view = 'browser-view';
                    if(hash!='#list'){
                        location.hash='#list'
                    }
                }else{
                    location.href = e.oldURL;
                }
            }
            document.body.className = view;
        };
        jump();
        window.addEventListener('hashchange',jump,false);

        //开启designMode,连接两种编辑器
        var editVisualButton= document.getElementById('edit_visual');
        var visualView = document.getElementById('file_contents_visual');
        var visualEditor = document.getElementById('file_contents_visual_editor');
        var visualEditorDoc = visualEditor.contentDocument;
        var editHtmlButton = document.getElementById('edit_html');
        var htmlView = document.getElementById('file_contents_html');
        var htmlEditor = document.getElementById('file_contents_html_editor');

        visualEditorDoc.designMode='on';

        visualEditorDoc.addEventListener('keyup',markDirty,false);
        htmlEditor.addEventListener('keyup',markDirty,false);

        var updateVisualEditor= function (content) {
            visualEditorDoc.open();
            visualEditorDoc.write(content);
            visualEditorDoc.close();
            visualEditorDoc.addEventListener('keyup',markDirty,false);
        };

        var updateHtmlEditor= function (content) {
            htmlEditor.value = content;
        };

        var toggleActiveView= function () {
            if(htmlView.style.display=='block'){
                editVisualButton.className = 'split_left active';
                visualView.style.display='block';
                editHtmlButton.className = 'split_right';
                htmlView.style.display='none';
                updateVisualEditor(htmlEditor.value);
            }else{
                editHtmlButton.className = 'split_right active';
                htmlView.style.display='block';
                editVisualButton.className = 'split_left';
                visualView.style.display='none';

                var x = new XMLSerializer();
                var content = x.serializeToString(visualEditorDoc);
                updateHtmlEditor(content);
            }
        };
        editVisualButton.addEventListener('click',toggleActiveView,false);
        editHtmlButton.addEventListener('click',toggleActiveView,false);

        //在可视化编辑器中实现富文本编辑工具栏
        var visualEditorToolbar = document.getElementById('file_contents_visual_toolbar');
        var richTextAction = function (e) {
            var command,node=(e.target.nodeName==='BUTTON')? e.target: e.target.parentNode;

            if(node.dataset){
                command =node.dataset.command;
            }else{
                command = node.getAttribute('data-command');
            }
            var doPopupCommand= function (command,promptText,promptDefault) {
                visualEditorDoc.execCommand(command,false,prompt(promptText,promptDefault));
            };
            if(command==='createLink'){
                doPopupCommand(command,'输入链接地址:','HTTP://www.example.com');
            }else if(command=='insertImage'){
                doPopupCommand(command,'输入图片地址:','http://www.example.com/image.png');
            }else if(command==='insertMap'){
                if(navigator.geolocation){
                    node.innerHTML = 'Loading';
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        var mapNode =document.createElement('div');
                        mapNode.style.width='200px';
                        mapNode.style.height='200px';
                        document.getElementsByTagName('iframe')[0].contentWindow.document.body.appendChild(mapNode);
                        mapNode.contentEditable = false;
                        // 百度地图API功能
                        var lat = pos.coords.latitude;
                        var lon = pos.coords.longitude;
                        /*BMap是百度地图的核心对象
                         BMap.map创建地图Map对象
                         参数是容器id*/
                        var map = new BMap.Map("map");
                        /*Point是中心点对象，两个参数分别是经度和纬度*/
                        var point = new BMap.Point(lon,lat);
                        /*地图按照指定等级，指定中心位置显示，等级越高看到的物体越清晰*/
                        map.centerAndZoom(point,13)

                        node.innerHTML = '当前位置';
                    });
                }else{
                    alert('地理定位不可用','没有定位数据');
                }
            }else{
                visualEditorDoc.execCommand(command);
            }
        };
        visualEditorToolbar.addEventListener('click',richTextAction,false);
    };


    var init = function () {
        new SuperEditor();
    };

    window.addEventListener('load',init,false);


})();

