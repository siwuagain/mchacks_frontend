<script>
import UploadService from "../services/UploadFilesService";
import http from "../http-common";

export default{
  el: '#app',
  
  data() {
    return {
      isCameraOpen: false,
      isPhotoTaken: false,
      isShotPhoto: false,
      isLoading: false,
      link: '#',

      currentImage: undefined,
      previewImage: undefined,
      progress: 0,
      message: "",
      imageInfos: [],
    }
  },
  
  methods: {
    toggleCamera() {
      if(this.isCameraOpen) {
        this.isCameraOpen = false;
        this.isPhotoTaken = false;
        this.isShotPhoto = false;
        this.stopCameraStream();
      } else {
        this.isCameraOpen = true;
        this.createCameraElement();
      }
    },
    
    createCameraElement() {
      this.isLoading = true;
      
      const constraints = (window.constraints = {
				audio: false,
				video: true
			});


			navigator.mediaDevices
				.getUserMedia(constraints)
				.then(stream => {
          this.isLoading = false;
					this.$refs.camera.srcObject = stream;
				})
				.catch(error => {
          this.isLoading = false;
					alert("May the browser didn't support or there is some errors.");
				});
    },
    
    stopCameraStream() {
      let tracks = this.$refs.camera.srcObject.getTracks();

			tracks.forEach(track => {
				track.stop();
			});
    },
    
    takePhoto() {
      if(!this.isPhotoTaken) {
        this.isShotPhoto = true;

        const FLASH_TIMEOUT = 50;

        setTimeout(() => {
          this.isShotPhoto = false;
        }, FLASH_TIMEOUT);
      }
      
      this.isPhotoTaken = !this.isPhotoTaken;
      
      const context = this.$refs.canvas.getContext('2d');
      context.drawImage(this.$refs.camera, 0, 0, 450, 337.5);
    },
    
    downloadImage() {
      const download = document.getElementById("downloadPhoto");
      const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
    .replace("image/jpeg", "image/octet-stream");
      download.setAttribute("href", canvas);
    },

    uploadImage() {
      console.log("Uploading image")
      const upload = document.getElementById("uploadPhoto");
      // const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg").replace("image/jpeg", "image/imgBase64");
      const canvas = document.getElementById("photoTaken")
      canvas.toBlob(function(blob){
        const formData = new FormData();
        formData.append('file', blob, 'my-photo.png');

        // Post via axios or other transport method
        http.post('http://127.0.0.1:5000/search', formData,{
          headers: {
            "Content-Type": "multipart/form-data"
        }
        });
      })
      console.log(canvas)
      this.progress = 0;
      UploadService.upload(canvas, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
        .then((response) => {
          this.message = response.data.message;
          return UploadService.getFiles();
        })
        .then((images) => {
          this.imageInfos = images.data;
        })
        .catch((err) => {
          this.progress = 0;
          this.message = "Could not upload the image! " + err;
          this.currentImage = undefined;
        });
    }
  }
};
</script>

<template>
<div id="app" class="web-camera-container">
  <div class="camera-button">
      <button type="button" class="button is-rounded" :class="{ 'is-primary' : !isCameraOpen, 'is-danger' : isCameraOpen}" @click="toggleCamera">
        <span v-if="!isCameraOpen">Open Camera</span>
        <span v-else>Close Camera</span>
    </button>
  </div>
  
  <div v-show="isCameraOpen && isLoading" class="camera-loading">
    <ul class="loader-circle">
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
  
  <div v-if="isCameraOpen" v-show="!isLoading" class="camera-box" :class="{ 'flash' : isShotPhoto }">
    
    <div class="camera-shutter" :class="{'flash' : isShotPhoto}"></div>
      
    <video v-show="!isPhotoTaken" ref="camera" :width="450" :height="337.5" autoplay></video>
    
    <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="450" :height="337.5"></canvas>
  </div>
  
  <div v-if="isCameraOpen && !isLoading" class="camera-shoot">
    <button type="button" class="button" @click="takePhoto">
      <img src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png">
    </button>
  </div>
  
  <div>
    <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
    <a id="downloadPhoto" download="my-photo.jpg" class="button" role="button" @click="downloadImage">
      Download
    </a>
  </div>

  <div v-if="isPhotoTaken && isCameraOpen" class="camera-upload">
    <a id="uploadPhoto" download="my-photo.jpg" class="button" role="button" @click="uploadImage">
      Upload
    </a>
  </div>

  </div>
 
</div>


</template>

<style scoped>

  #photoTaken {
    border-radius: 3px;
    margin: 0.5rem;
  }
  .camera-box {
    border-radius: 5px;
    align-self: center;
  }
  .camera-shoot {
    margin: 1rem 0;
  }
  .camera-shoot img {
    height: 35px;
    object-fit: cover;
  }
  .camera-shoot button {
      height: 60px;
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #a2588d;
      border-radius: 100%;
  }

  .camera-shoot button:hover{
    background-color: #b04993;
  }
  
  .web-camera-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding: 5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 550px;
    height: fit-content;
    background-color: rgb(239, 239, 239);
  }

  .camera {
    border-radius: px;
    width: fit-content;
    padding: 2px;
  }

  .camera-button {
    color: white;
    background-color: #4756a2;
    border-radius: 6px;
  }

  .camera-button:hover{
    background-color: #2c43b7;
  }

  #uploadPhoto,
  #downloadPhoto{
    color: black;
  }

</style>