import React from "react";
import "./toolbox.css"; // Import CSS for styling

const Toolbox = () => {
  return (
    <div className="toolbox">
      <h3>Toolbox</h3>
      {/* <table className="toolbox-table">
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index}>
              <td>Row {index + 1}, Col 1</td>
              <td>Row {index + 1}, Col 2</td>
              <td>Row {index + 1}, Col 3</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};

export default Toolbox;