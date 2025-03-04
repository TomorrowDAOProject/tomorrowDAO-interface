import dayjs from 'dayjs';
export function getFormattedDate(date: number, type: string) {
  if (date) {
    if (type === 'Date Time') {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    }
    const seconds = dayjs().diff(date, 'seconds');
    const minutes = dayjs().diff(date, 'minutes');
    const hours = dayjs().diff(date, 'hours');
    const days = dayjs().diff(date, 'days');

    if (minutes < 1) return `${seconds < 0 ? 0 : seconds} secs ago`;
    if (minutes < 60) return `${minutes % 60} mins ago`;
    if (hours < 24) return `${hours} hrs ${minutes % 60} mins ago`;
    return `${days} days ${hours % 24} hrs ago`;
  }
  return '';
}

export function combineDateAndTime(dateA: number | string, dateB: number | string) {
  if (!dayjs(dateA).isValid() || !dayjs(dateB).isValid()) {
    return dateA;
  }
  const dateAPart = dayjs(dateA);
  const dateBPart = dayjs(dateB);

  const combinedDate = dateAPart
    .hour(dateBPart.hour())
    .minute(dateBPart.minute())
    .second(dateBPart.second());

  return combinedDate.valueOf();
}
