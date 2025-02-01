import React, { useState, useRef, useEffect } from "react";
import HorizontalLine from "../horizontal_line";
import axios from "axios";

interface InputField {
    value: string;
}

const PlaylistBuilder = () => {
  // State for playlist name
  const [playlistName, setPlaylistName] = useState("");
  const [hovered, setHovered] = useState<boolean | null>(false);

  // State for keyword inputs
  const [inputs, setInputs] = useState<InputField[]>([{value: "" }]);
  const [hoveredButtonId, setHoveredButtonId] = useState<number | null>(null);
  const [newFieldIndex, setNewFieldIndex] = useState<number | null>(null);

  // Refs to track each input
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // State for playlist URL
  const [playlist_url, setPlaylistUrl] = useState("");
  const [receipt, setReceipt] = useState(false);

  const addNewInput = () => {
    setInputs((prev) => [
      ...prev,
      {value: "" }, // Add a new input field
    ]);
    setNewFieldIndex(inputs.length);
  };

  const handleInputChange = (idx: number, newValue: string) => {
    setInputs((prev) =>
      prev.map((input, i) =>
        i === idx ? { ...input, value: newValue } : input
      )
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addNewInput();
    }
  };

  const clearInput = (index: number) => {
    if (index === -1) {
      setPlaylistName("");
    } else {
      setInputs((prev) => {
        setNewFieldIndex(index);
        if (prev[index].value === "") {
          return prev.length === 1 ? prev : prev.filter((_, i) => i !== index);
        } else {
          return prev.map((input, i) =>
            i === index ? { ...input, value: "" } : input
          );
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (inputs.length === 1 && inputs[0].value === "") {
      alert("Please enter at least one keyword");
      return;
    }

    try {
      const keywords = inputs.map((input) => input.value).filter((value) => value !== "");

      const payload = {
        playlistName: playlistName,
        keywords: keywords
      }

      console.log("Payload:", payload);
      // Send POST request to backend
      const response = await axios.post("http://localhost:8080/create-playlist", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response:", response.data);

      setPlaylistUrl(response.data.url);
      setReceipt(true);
      alert("Playlist created successfully!");
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist");
    }
  };

  useEffect(() => {
    if (newFieldIndex !== null && inputRefs.current[newFieldIndex]) {
      inputRefs.current[newFieldIndex].focus();
      setNewFieldIndex(null);
    }
  }, [newFieldIndex]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Playlist Builder</h1>

      {receipt && (<h3><a href={playlist_url} target="_blank">Click me to see your playlist</a></h3>)}
      <div style={styles.keywordsContainer}>
        <input
          type="text"
          value={playlistName}
          placeholder="Playlist name"
          onChange={(e) => setPlaylistName(e.target.value)}
          style={styles.input}
        />
        {playlistName && (
          <button onClick={() => clearInput(-1)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={
            hovered ? { ...styles.clearButton, ...styles.clearButtonHover } : styles.clearButton}>
            &times;
          </button>
        )}
      </div>

      <HorizontalLine/>

      {inputs.map((input, index) => (
        <div style={styles.keywordsContainer}>
          <input
            type="text"
            value={input.value}
            placeholder="Keyword (song name, artist name, etc.)"
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e)}
            ref={(el) => (inputRefs.current[index] = el!)}
            style={styles.input}
          />
          {(
            <button
              onClick={() => clearInput(index)}
              onMouseEnter={() => setHoveredButtonId(index)}
              onMouseLeave={() => setHoveredButtonId(null)}
              style={{
                ...styles.clearButton,
                ...(hoveredButtonId === index
                  ? styles.clearButtonHover
                  : {}),
              }}
            >
              &times;
            </button>
          )}
        </div>
      ))}

      <button onClick={handleSubmit} style={styles.submitButton}>
        Submit
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "400px",
    maxWidth: "400px",
    margin: "0 auto",
    textAlign: "center" as const,
    color: "white",
  },
  title: {
    fontSize: "50px",
    marginBottom: "1em",
  },
  keywordsContainer: {
    position: "relative",
    display: "block",
    marginBottom: "10px",
  },
  input: {
    padding: "10px 30px 10px 10px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "50px", // Rounded corners
    border: "2px solid #1DB954",
  },
  clearButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
    borderRadius: "50%", // Circular button
    width: "24px",
    height: "24px",
    lineHeight: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background 0.3s",
  },
  clearButtonHover: {
    color: "#fff",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#00ff00",
    color: "black",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
  },
  submitButton: {
    borderRadius: "8px",
    border: "2px solid transparent",
    padding: "0.6em 1.2em",
    fontSize: "1em",
    fontWeight: "500",
    fontFamily: "inherit",
    backgroundColor: "#323232",
    cursor: "pointer",
    transition: "border-color 0.25s",
  },
};

export default PlaylistBuilder;
