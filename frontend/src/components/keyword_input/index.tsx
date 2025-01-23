import React, { useState } from "react";

interface InputField {
  value: string;
}

const KeywordInput: React.FC = () => {
  const [inputs, setInputs] = useState<InputField[]>([{value: "" }]);
  const [hoveredButtonId, setHoveredButtonId] = useState<number | null>(null);

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

  const addNewInput = () => {
    setInputs((prev) => [
      ...prev,
      {value: "" }, // Add a new input field
    ]);
  };

  const clearInput = (index: number) => {
    setInputs((prev) => {
      if (prev[index].value === "") {
        return prev.length === 1 ? prev : prev.filter((_, i) => i !== index);
      } else {
        return prev.map((input, i) =>
          i === index ? { ...input, value: "" } : input
        );
      }
    });
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <div style={styles.keywordsContainer}>
          <input
            type="text"
            value={input.value}
            placeholder="Keyword (song name, artist name, etc.)"
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e)}
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
    </div>
  );
};

// Styles for the component
const styles: { [key: string]: React.CSSProperties } = {
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
};



export default KeywordInput;
