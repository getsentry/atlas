export const convertValue = (value) => {
  if (value === false) {
    return "false";
  } else if (value === true) {
    return "true";
  } else if (value === 0) {
    return "0";
  } else if (!value) {
    return "";
  } else {
    return '"' + value.replace(/"/g, '""') + '"';
  }
};

export const downloadCsv = (rows, filename) => {
  let data = rows.map((row) => row.map(convertValue).join(",")).join("\r\n");

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(data, filename);
  } else {
    //In FF link must be added to DOM to be clicked
    let link = document.createElement("a");
    let blob = new Blob(["\ufeff", data]);
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
