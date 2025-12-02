function generateQR() {
    let url = document.getElementById("urlInput").value.trim();

    if (url === "") {
        alert("Please enter a valid URL!");
        return;
    }

    // Auto-fix: if URL does not start with http/https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    // Auto-fix: if URL ends with "?"
    if (url.endsWith("?")) {
        url += "v=1";   // prevents scanners from treating it as plain text
    }

    // Clear previous QR
    document.getElementById("qrcode").innerHTML = "";

    // Generate new QR
    new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
