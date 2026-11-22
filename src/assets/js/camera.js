
document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-camera]").forEach(component => {

    const video = component.querySelector(".camera-video");
    const canvas = component.querySelector(".camera-canvas");
    const result = component.querySelector(".camera-result");

    const placeholder = component.querySelector(".camera-placeholder");

    const startButton = component.querySelector(".camera-start");
    const captureButton = component.querySelector(".camera-capture");
    const stopButton = component.querySelector(".camera-stop");
    const retakeButton = component.querySelector(".camera-retake");

    const fileInput = component.querySelector(".camera-file-input");
    const status = component.querySelector(".camera-status");

    let stream = null;
    let capturedBlob = null;
    let resultUrl = null;

    function stopCamera() {

      if (stream) {

        stream.getTracks().forEach(track => track.stop());

        stream = null;

      }

      video.srcObject = null;

      video.hidden = true;
      captureButton.hidden = true;
      stopButton.hidden = true;

      startButton.hidden = false;

    }

    async function startCamera() {

      if (!navigator.mediaDevices?.getUserMedia) {

        status.textContent =
          "Live camera is unavailable. Use the file capture option instead.";

        return;

      }

      try {

        stream = await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: { ideal: "environment" }
          },

          audio: false

        });

        video.srcObject = stream;

        await video.play();

        video.hidden = false;
        placeholder.hidden = true;

        result.hidden = true;

        startButton.hidden = true;
        captureButton.hidden = false;
        stopButton.hidden = false;

        status.textContent = "Camera is ready.";

      } catch (error) {

        status.textContent =
          "Unable to access camera. Check browser permissions.";

      }

    }

    function capturePhoto() {

      if (!video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(blob => {

        if (!blob) {

          status.textContent = "Unable to capture photograph.";
          return;

        }

        capturedBlob = blob;

        if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
        }

        resultUrl = URL.createObjectURL(blob);

        result.src = resultUrl;
        result.hidden = false;

        stopCamera();

        retakeButton.hidden = false;

        status.textContent = "Photograph captured.";

      }, "image/jpeg", 0.9);

    }

    function retakePhoto() {

      capturedBlob = null;

      result.hidden = true;
      placeholder.hidden = false;

      retakeButton.hidden = true;

      startCamera();

    }

    startButton.addEventListener("click", startCamera);

    captureButton.addEventListener("click", capturePhoto);

    stopButton.addEventListener("click", () => {

      stopCamera();
      status.textContent = "Camera stopped.";

    });

    retakeButton.addEventListener("click", retakePhoto);

    fileInput.addEventListener("change", () => {

      const file = fileInput.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {

        status.textContent = "Please select an image.";
        fileInput.value = "";
        return;

      }

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      stopCamera();

      capturedBlob = file;
      resultUrl = URL.createObjectURL(file);

      result.src = resultUrl;
      result.hidden = false;

      placeholder.hidden = true;
      retakeButton.hidden = false;

      status.textContent = "Image selected.";

    });

    // Expose captured file to the containing application.
    component.getCapturedFile = () => capturedBlob;

    // Release the camera if the page is being unloaded.
    window.addEventListener("pagehide", stopCamera);

  });

});
