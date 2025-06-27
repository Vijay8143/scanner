const resultDiv = document.getElementById('result');
let html5QrcodeScanner;
let scannerRunning = false;

function startScanner() {
  if (scannerRunning) return;

  html5QrcodeScanner = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 250 };

  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    qrCodeMessage => {
      stopScanner();
      countdownAndRedirect(qrCodeMessage);
    },
    errorMessage => {
      console.warn(`QR Code no match: ${errorMessage}`);
    }
  ).then(() => {
    scannerRunning = true;
  }).catch(err => {
    if (err.toString().includes("NotReadableError")) {
      resultDiv.innerText = "Camera is in use by another application. Please close it and try again.";
    } else {
      resultDiv.innerText = `Camera Error: ${err}`;
    }
  });
}

function stopScanner() {
  if (html5QrcodeScanner && scannerRunning) {
    html5QrcodeScanner.stop().then(() => {
      console.log("Scanner stopped.");
      scannerRunning = false;
    }).catch(err => {
      console.error("Error stopping scanner:", err);
    });
  } else {
    console.warn("Scanner not running, can't stop.");
  }
}

function scanImage(input) {
  if (input.files.length === 0) return;

  const file = input.files[0];
  const qr = new Html5Qrcode("reader");

  qr.scanFile(file, true)
    .then(qrCodeMessage => {
      countdownAndRedirect(qrCodeMessage);
    })
    .catch(err => {
      resultDiv.innerText = `Image scan error: ${err}`;
    });
}

// 🎯 Countdown and redirect logic
function countdownAndRedirect(qrCodeMessage) {
  let url = qrCodeMessage.trim();
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  let count = 3;
  resultDiv.innerText = `Scanned: ${qrCodeMessage}\nRedirecting in ${count}...`;
  
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      resultDiv.innerText = `Scanned: ${qrCodeMessage}\nRedirecting in ${count}...`;
    } else {
      clearInterval(countdownInterval);
      window.location.href = url;
    }
  }, 1000);
}
