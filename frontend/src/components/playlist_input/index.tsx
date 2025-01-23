import React, { useState } from "react";

interface ClearableInputProps {
  placeholder?: string;
  value?: string;
}

const ClearableInput: React.FC<ClearableInputProps> = ({
  placeholder = "Playlist name",
  value = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [hovered, setHovered] = useState<boolean | null>(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const clearInput = () => {
    setInputValue("");
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        style={styles.input}
      />
      {inputValue && (
        <button onClick={clearInput}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         style={
           hovered ? { ...styles.clearButton, ...styles.clearButtonHover } : styles.clearButton}>
          &times;
        </button>
      )}
    </div>
  );
};

// Styles for the component
const styles: { [key: string]: React.CSSProperties } = {
  container: {
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
};

export default ClearableInput;
