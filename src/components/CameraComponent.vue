<script>
import UploadService from "../services/UploadFilesService";
import http from "../http-common";
import { formToJSON } from "axios";

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

      dataReturned: false,
      dataJSON: [],
    }
  },
  
  methods: {
    toggleCamera() {
      if(this.isCameraOpen) {
        this.isCameraOpen = false;
        this.isPhotoTaken = false;
        this.isShotPhoto = false;
        this.dataReturned = false;
        this.dataJSON = []
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
      this.dataJSON = []
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
        }).then((response) => {
          console.log(response.data)
          this.dataJSON = JSON.parse(response.data);
        });
      })
      this.progress = 0;
      this.dataReturned = true;
      console.log(this.dataJSON)
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

<div v-if="dataReturned" class="flex items-center justify-center w-full py-3">
  <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 bg-white border-gray-300 border-dashed rounded-lg ">
   
<div class="relative overflow-x-auto">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Nutrition fact
                </th>
                <th scope="col" class="px-6 py-3">
                    Value
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in dataJSON" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ item.message }}
                </th>
            </tr>
        </tbody>
    </table>
</div>

  </label>
</div>


</template>

<style scoped>

  #photoTaken {
    border-radius: 3px;
    margin: 0.5rem;
  }
  .camera-box {
    border-radius: 3px;
    margin: 0.5rem;
    align-self: center;
    width: 450px;
    height: 337.5px;
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
      background-color: #4756a2;
      border-radius: 6px;
  }

  .camera-shoot button:hover{
    background-color: #2c43b7;
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
    width: full;
    height: fit-content;
    background-color: white;
    min-height: 300px;
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
    padding-left: 10%;
    padding-right: 10%;
    width: 100px;
  }

  .camera-shoot img{
    filter: brightness(0) invert(1); 
  }

  .camera-button:hover{
    background-color: #2c43b7;
  }

  #uploadPhoto,
  #downloadPhoto{
    color: white;
    background-color: #4756a2;
    border-radius: 6px;
    padding-left: 10%;
    padding-right: 10%;
    width: 100px;
  }

</style>