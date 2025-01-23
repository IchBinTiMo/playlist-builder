import React, { useState } from "react";

interface InputField {
  id: number;
  value: string;
}

const KeywordInput: React.FC = () => {
  const [inputs, setInputs] = useState<InputField[]>([{ id: 0, value: "" }]);
  const [hoveredButtonId, setHoveredButtonId] = useState<number | null>(null);

  const handleInputChange = (id: number, newValue: string) => {
    setInputs((prev) =>
      prev.map((input) =>
        input.id === id ? { ...input, value: newValue } : input
      )
    );
  };

  const handleKeyPress = (id: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addNewInput();
    }
  };

  const addNewInput = () => {
    setInputs((prev) => [
      ...prev,
      { id: prev.length, value: "" }, // Add a new input field
    ]);
  };

  const clearInput = (id: number) => {
    setInputs((prev) => {
      const targetInput = prev.find((input) => input.id === id);

      if (targetInput?.value === "") {
        // If the input is empty, remove the field
        return prev.length === 1 ? prev : prev.filter((input) => input.id !== id);
      } else {
        // Otherwise, clear the content
        return prev.map((input) =>
          input.id === id ? { ...input, value: "" } : input
        );
      }
    });
  };

  return (
    <div>
      {inputs.map((input) => (
        <div key={input.id} style={styles.container}>
          <input
            type="text"
            value={input.value}
            placeholder="Keyword (song name, artist name, etc.)"
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            onKeyPress={(e) => handleKeyPress(input.id, e)}
            style={styles.input}
          />
          {(
            <button
              onClick={() => clearInput(input.id)}
              onMouseEnter={() => {setHoveredButtonId(input.id); console.log(hoveredButtonId, input.id)}}
              onMouseLeave={() => setHoveredButtonId(null)}
              style={{
                ...styles.clearButton,
                ...(hoveredButtonId === input.id
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



export default KeywordInput;
