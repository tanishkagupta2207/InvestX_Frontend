import React from "react";

function Alert(props) {
  const capitalize = (word) => {
    if (!word) return '';
    if (word === "danger") {
      word = "error";
    }
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const alertContainerStyle = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: 'auto',
    minWidth: '300px',
    maxWidth: 'calc(100% - 40px)',
  };
  return (
    <div className="fixed-alert" style={alertContainerStyle}>
      {props.alert && (
        <div
          className={`alert alert-${props.alert.type} alert-dismissible fade show shadow-lg`} 
          role="alert"
        >
          <strong>{capitalize(props.alert.type)}</strong>: {props.alert.msg}
          {/* <button type="button" className="btn-close" onClick={handleCloseAlert}></button> */} {/*TODO*/}
        </div>
      )}
    </div>
  );
}

export default Alert;