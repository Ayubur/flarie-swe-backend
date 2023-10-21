export const getNumberOfDaysFromDateRange = (startDate, endDate) => {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const difference_in_time = date2.getTime() - date1.getTime();
  const difference_in_days = difference_in_time / (1000 * 3600 * 24);
  return difference_in_days;
};
