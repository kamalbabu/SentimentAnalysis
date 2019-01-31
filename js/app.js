let elemVideo, elmCanvas, ctxCanvas, track;

let elemHighlight, ctxHighlight;

let rotation = 0,
  loopFrame,
  centerX,
  centerY,
  twoPI = Math.PI * 2;


function bootCam() {
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  if (!navigator.getUserMedia) { return false; }

  elemVideo.on('loadedmetadata', function () {
    width = elmCanvas[0].width = elemVideo[0].videoWidth;
    height = elmCanvas[0].height = elemVideo[0].videoHeight;
    elemHighlight[0].width = height;
    elemHighlight[0].height = width;
    centerX = width / 2;
    centerY = height / 2;
    startLoop();
  });
 
  elmCanvas.on('click', function () {
    if (track) {
      if (track.stop) { track.stop(); }
      track = null;
    } else {
      loadCam();
    }
  });

  navigator.getUserMedia({ video: true, audio: false }, function (stream) {
    elemVideo[0].srcObject = stream;
    track = stream.getTracks()[0];
  }, function (e) {
    console.error('Rejected!', e);
  });
}

function loop() {
  loopFrame = requestAnimationFrame(loop);
  ctxCanvas.save();
  ctxCanvas.globalAlpha = 0.1;
  ctxCanvas.drawImage(elemVideo[0], 0, 0, width, height);
  ctxCanvas.restore();
}

function startLoop() {
  loopFrame = loopFrame || requestAnimationFrame(loop);
}

function base64ToByteArray(base64String) {
  try {
    var sliceSize = 1024;
    var byteCharacters = atob(base64String);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return byteArrays;
  } catch (e) {
    console.log("Couldn't convert to byte array: " + e);
    return undefined;
  }
}



function postData(bdata) {

  let url = "https://eastus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise";

  return fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key":"0fba68ef7b9a485cb0dd53ea0f57f2e0"
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    body:bdata, // body data type must match "Content-Type" header
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function makeBlob (dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: contentType });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function findEmotion(emotions){
  console.log(emotions);
  var emotionText ="";
  var probableEmotion =""
  var probValue=0 ;
    for(var i in emotions){
      //console.log(i);
      if(emotions[i]>0){
        if(probValue<emotions[i]){
          probValue = emotions[i];
          probableEmotion = i;
        }
      }
    }
    console.log(probableEmotion);

   switch(probableEmotion){
        case 'anger': 
                    emotionText = "Angry"
                    break;
        case 'contempt': 
                    emotionText = "Contempt"
                    break;
        case 'disgust':
                    emotionText = "Disgust"
                    break;
        case 'fear':
                    emotionText = "Fear"
                    break;
        case 'happiness':  
                    emotionText = "Happiness"
                    break;
        case 'neutral':  
                    emotionText = "Neutral"
                    break;
        case 'sadness':  
                    emotionText = "Sadness"
                    break;
        case 'surprise':  
                    emotionText = "Suprise"
                    break;
        default : 
                    emotionText = "Who are you?"
                    break;
   }

   return emotionText;

}

$(document).ready(function () {
  elemVideo = $("#elmVideoOrginal");
  elmCanvas = $("#elmCanvas");
  elemHighlight =$("#elmHighlight"); 
  
  $("#btnCapture").click(function () {
    let data = elmCanvas[0].toDataURL("image/jpeg");
    var cData= makeBlob(data);
    //console.log(data);
    //data = data.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
    //console.log(data);
    //bdata = base64ToByteArray(data);
    //console.log(bdata);
    //console.log(cData);
     postData(cData).then(function(faceList){
      ctxCanvas.save();
      ctxCanvas.setTransform(1, 0, 0, 1, 0, 0);
      ctxCanvas.clearRect(0, 0, elmCanvas[0].width, elmCanvas[0].height);
      ctxCanvas.beginPath();
      faceList.forEach(face => {
        //console.log(face);
        let emotionText = findEmotion(face["faceAttributes"]["emotion"]);
        let rect = face.faceRectangle;
        //console.log(elmCanvas[0].width);


        ctxCanvas.font = "20px Arial";
        ctxCanvas.fillText(emotionText,rect.left,rect.top);

        ctxCanvas.rect(rect.left,rect.top,rect.height,rect.width);
        ctxCanvas.lineWidth =2;
        ctxCanvas.strokeStyle ='green';
        ctxCanvas.stroke();
        

        /**
         
         ctxHighlight.save();
        ctxHighlight.setTransform(1, 0, 0, 1, 0, 0);
        ctxHighlight.clearRect(0, 0, elmCanvas[0].width, elmCanvas[0].height);
        ctxHighlight.beginPath();

        ctxHighlight.font = "20px Arial";
        ctxHighlight.fillText(emotionText,rect.left,rect.top);

        ctxHighlight.rect(rect.left,rect.top,rect.height,rect.width);
        ctxHighlight.lineWidth =2;
        ctxHighlight.strokeStyle ='green';
        ctxHighlight.stroke();

         */
       
      });


    });
   
  });

    ctxHighlight = elemHighlight[0].getContext('2d');
    ctxCanvas = elmCanvas[0].getContext('2d');
    bootCam();

  setInterval(function(){

    $("#btnCapture").trigger( "click" );

  },500)
});
