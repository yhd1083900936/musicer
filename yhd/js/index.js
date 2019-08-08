(function () {
    var falg=false;
    $('.play-list').on('click',function () {
        falg=!falg;
        if (falg){
            $('.play-list-box').animate({
                bottom:46
            },300)
        }else{
            $('.play-list-box').animate({
                bottom:-200
            },300)
        }
    });
    // 模拟数据
    let data = localStorage.getItem('mList')?JSON.parse(localStorage.getItem('mList')):[];
    let searchData=[];
    //获取元素
    let startbox=document.querySelector('.start');
    let audiobox=document.querySelector('audio');
    let songSinger=document.querySelector('.ctrl-bars-box span');
    let imglogo=document.querySelector('.logo img');
    let listBox=document.querySelector('.play-list-box ul');
    let prevBox=document.querySelector('.prev');
    let nextBox=document.querySelector('.next');
    let nowTimeSpan=document.querySelector('.nowTime');
    let totalTimeSpan=document.querySelector('.totalTime');
    let ctrlBars=document.querySelector('.ctrl-bars');
    let nowbars=document.querySelector('.nowBars');
    let ctrlbtn=document.querySelector('.ctrl-btn');
    let modeBtn=document.querySelector('.mode');
    let infoEl=document.querySelector('.info');
    let  index=0;//变量
    let rotateDeg=0;//记录旋转角度
    let timer=null;//保存定时器
    let modM=0;//0代表顺序播放 1代表循环播放 2代表随机播放
    //加载播放数量
    function loadNum(){
        $('.play-list').html(data.length);
    }
    loadNum();
    // 加载数量结束
    // 加载播放列表
    function loadPlayList(){
        if(data.length){
            let str='';//用来累计播放项
            for(let i=0;i<data.length;i++){
                str+='<li>';
                str+='<span class="left">'+data[i].name+'</span>';
                str+='<i>X</i>';
                str+='<span class="right">';
                for(let j=0; j<data[i].ar.length; j++){
                    str+=data[i].ar[j].name+' ';
                }
                str+='</span>';

                str+='</li>';

            }
            listBox.innerHTML=str;
        }
    }
    loadPlayList();
    // 请求服务器
    $('.search').on('keydown',function (e) {
        // 13代表的是按下回车
        if (e.keyCode===13){
            $.ajax({
                url:'http://music.163.com/api/search/pc',
                data:{
                    type:1,
                    s:this.value,
                    offset:0,
                    limit:10
                },
                success:function (data) {

                    console.log(data);
                    searchData=data.result.songs;
                    var str='';
                    for(var i=0; i<searchData.length; i++){
                        str+='<li>';
                        str+='<span class="left song">'+searchData[i].name+'</span>';
                        str+='<span class="right song">';
                        for(let j=0; j<searchData[i].ar.length; j++){
                            str+=searchData[i].ar[j].name+' ';
                        }
                        str+='</span>';
                        str+='</li>';

                    }
                    $('.searchUl').html(str);
                },
                error:function (err) {
                    console.log(err);
                }
            });
            this.value='';
            $('.searchUl').css("display","block");
        }
    });

    $('.searchUl').on('click','li',function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));

        loadPlayList();
        index=data.length-1;
        init();
        play();
        loadNum();
    });
    $(listBox).on('click','i',function (e) {
        data.splice( $(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        e.stopPropagation();
        loadNum();
    })
    // 切换选择列表
    function   checkPlayList() {
        let playList=document.querySelectorAll('.play-list-box li');
        for(let i=0;i<data.length;i++){
            playList[i].className='';
        }
        playList[index].className='active';
    }
    function  formatTime(time) {
        return time>9?time:'0'+time;
    }
    // 初始化歌曲
    function init(){
        rotateDeg=0;
        checkPlayList();
        //给audio设置播放路径
        audiobox.src='http://music.163.com/song/media/outer/url?id='+data[index].id+'.mp3' ;
        let str='';
        str+=data[index].name+'----';
        for(let i=0;i<data[index].ar.length;i++){
            str+=data[index].ar[i].name+'';
        }
        songSinger.innerHTML=str;
        imglogo.src=data[index].al.picUrl;
    }
    init();
    // 播放
    function play(){
        audiobox.play();
        clearInterval(timer);
        timer= setInterval(function () {
            rotateDeg++;
            imglogo.style.transform='rotate('+rotateDeg+'deg)';
        },30);
        startbox.style.backgroundPositionY='-159px';
    }
    // 播放和暂停
    startbox.addEventListener('click',function () {
        // 检测是播放还是暂停
        if(audiobox.paused){
            play();
        }else{
            clearInterval(timer);
            audiobox.pause();
            startbox.style.backgroundPositionY='-198px';
        }
    });
    // 下一曲
    nextBox.addEventListener('click',function () {
        index++;
        index=index>data.length-1?0:index;
        init();
        play();
    });
    //提示框
    function info(str){
        infoEl.style.display='block';
        infoEl.innerHTML=str;
        setTimeout(function () {
            infoEl.style.display='none';
        },1000)
    }
    // 上一曲
    prevBox.addEventListener('click',function () {
        index--;
        index=index<0?data.length-1:index;
        init();
        play();
    });
    // 递归算法
    function randomNu(){
        let randomNum=Math.floor( Math.random()*data.length);
        if(randomNum===index){
            randomNum=randomNu();
        }
        return randomNum;
    }
    // 完成准备
    audiobox.addEventListener('canplay',function () {
        let totalTime= audiobox.duration;//总时长
        let totalM=parseInt(totalTime/60);
        let totalS=parseInt(totalTime%60);
        totalTimeSpan.innerHTML=formatTime(totalM)+':'+formatTime(totalS);
        audiobox.addEventListener('timeupdate',function () {
            let currenTime=audiobox.currentTime;
            let currentM=parseInt(currenTime/60);
            let currentS=parseInt(currenTime%60);
            nowTimeSpan.innerHTML=formatTime(currentM)+':'+formatTime(currentS);
            let barWidth=ctrlBars.clientWidth;
            let position=currenTime/totalTime * barWidth;
            nowbars.style.width=position+'px';
            ctrlbtn.style.left=position-8+'px';
            if(audiobox.ended){
                switch (modM) {
                    // 顺序播放
                    case 0:
                        nextBox.click();
                        break;
                    case 1: // 单曲循环
                        init();
                        play();
                        break;
                    case 2:
                        index=randomNu();
                        init();
                        play();
                        break;
                }
            }
        });
        ctrlBars.addEventListener('click',function (e) {
            audiobox.currentTime=e.offsetX / ctrlBars.clientWidth * audiobox.duration;
        });

    });
    // 完成结束


    modeBtn.addEventListener('click',function () {
        modM++;
        modM= modM > 2?0:modM;
        console.log(modM);
        switch (modM) {
            case 0:
                info('顺序播放');
                modeBtn.style.backgroundPositionX='0px';
                modeBtn.style.backgroundPositionY='275px';
                modeBtn.addEventListener('mouseenter',function () {
                    modeBtn.style.backgroundPositionX='-33px';
                    modeBtn.style.backgroundPositionY='275px';
                });
                modeBtn.addEventListener('mouseleave',function () {
                    modeBtn.style.backgroundPositionX='0px';
                    modeBtn.style.backgroundPositionY='275px';
                });
                break;
            case 1:
                info('单曲播放');
                modeBtn.style.backgroundPositionX='86px';
                modeBtn.style.backgroundPositionY='275px';
                modeBtn.addEventListener('mouseenter',function () {
                    modeBtn.style.backgroundPositionX='56px';
                    modeBtn.style.backgroundPositionY='275px';
                });
                modeBtn.addEventListener('mouseleave',function () {
                    modeBtn.style.backgroundPositionX='86px';
                    modeBtn.style.backgroundPositionY='275px';
                });
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX='86px';
                modeBtn.style.backgroundPositionY='370px';
                modeBtn.addEventListener('mouseenter',function () {
                    modeBtn.style.backgroundPositionX='58px';
                    modeBtn.style.backgroundPositionY='370px';
                });
                modeBtn.addEventListener('mouseleave',function () {
                    modeBtn.style.backgroundPositionX='86px';
                    modeBtn.style.backgroundPositionY='370px';
                });
                break;
        }
    });
    // 点击搜索列表播放对应的歌曲
    $(listBox).on('click','li',function () {
        index = $(this).index();
        init();
        play();
    });
    $('.voice').on('click',function () {
        falg=!falg;
        if (falg){
            $('.lineDiv').css("display","block")
        }else{
            $('.lineDiv').css("display","none")
        }


    })
})();



