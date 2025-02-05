document.getElementById("submit").addEventListener("click", async() => {
    const playlistName = document.getElementById("playlistName").value;
    let keywords = document.getElementById("keywords").value;

    console.log(playlistName, keywords);

    if (keywords.length === 0) {
        alert("Please enter at least one keyword");
        return;
    }

    keywords = keywords.split("\n").map((keyword) => keyword.trim());

    const payload = {
        playlistName: playlistName,
        keywords: keywords
    }

    console.log("Payload:", payload);

    // Send POST request to backend
    fetch("http://44.246.23.178:8080/create-playlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }).then(async (response) => {
        console.log("Response:", response);
    
        if (response.ok) {
            const data = await response.json();
            document.getElementById("playlistLink").href = data.url;
            document.getElementById("playlistLink").textContent = "Click me to see your playlist";
            console.log(data.url);
        } else {
            console.log("Playlist creation failed");
        }
        
    });
});