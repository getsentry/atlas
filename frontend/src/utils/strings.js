export const getColumnTitle = function(column) {
  switch (column) {
    case "dateStarted":
      return "Start Date";
    default:
      let columnPieces = column.split(".");
      let columnName = columnPieces[columnPieces.length - 1];
      return columnName.substr(0, 1).toUpperCase() + columnName.substr(1);
  }
};
