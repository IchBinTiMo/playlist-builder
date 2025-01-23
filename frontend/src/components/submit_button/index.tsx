import React, { useState } from "react";

interface SubmitButtonProps {
  color?: string;
  height?: string;
  margin?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = () => {
  const [hovered, setHovered] = useState<boolean | null>(false);
  return (
    <button
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    style={{
        ...style.button,
        ...(hovered && style.buttonHover),
    }}
    >Create</button>
  );
};

const style: { [key: string]: React.CSSProperties } = {
  button: {
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
  buttonHover: {
    borderColor: "#1DB954",
  },
  buttonFocusVisible: {
    outline: "4px auto -webkit-focus-ring-color",
  },
};

export default SubmitButton;
