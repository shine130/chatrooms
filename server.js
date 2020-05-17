var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {} //用来缓存文件内容的对象
var chatServer = require('./lib/chat_server');

var server = http.createServer(function(request,response){
  //创建HTTP服务器，用匿名函数定义对每个请求的处理行为
  var filePath = false;
  if(request.url == '/'){
    filePath = 'public/index.html'; //确定返回的默认HTML文件
  }else{
    filePath = 'public' + request.url; //将URL路径转为文件的相对路径
  }

  var absPath = './' + filePath;

  serveStatic(response,cache,absPath); //返回静态文件
})

server.listen(3000,function(){
  console.log('Server listening on port 3000.')
})

chatServer.listen(server);

function send404(response){
  response.writeHead(404,{'Content-Type':'text/plain'});
  response.write('Error 404:resource not found.');
  response.end();
}

function sendFile(response,filePath,fileContents){
  response.writeHead(200,{'Content-Type':mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

function serveStatic(response,cache,absPath){
  if(cache[absPath]){ //检查文件是否缓存在内存中
    sendFile(response,absPath,cache[absPath]); //从内存中返回文件
  }else{
    fs.exists(absPath,function(exists){ //检查文件是否存在
      if(exists){
        fs.readFile(absPath,function(err,data){ //从硬盘中读取文件
          if(err){
            send404(response);
          }else{
            cache[absPath] = data;
            sendFile(response,absPath,data); //从硬盘中读取文件并返回
          }
        })
      }else{
        send404(response);
      }
    })
  }
}