import React from "react";

interface HorizontalLineProps {
  color?: string;
  height?: string;
  margin?: string;
}

const HorizontalLine: React.FC<HorizontalLineProps> = () => {
  return (
    <hr
      style={style.hr}
    />
  );
};

const style: { [key: string]: React.CSSProperties } = {
  hr: {
    border: "0",
    height: "1px",
    backgroundColor: "#777",
    margin: "20px 0",
  }
};

export default HorizontalLine;
