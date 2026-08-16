export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  let parsedDateString = dateString;
  if (
    typeof dateString === 'string' &&
    !dateString.endsWith('Z') &&
    !dateString.includes('+') &&
    !dateString.includes('GMT')
  ) {
    // Standardize space separator to 'T' for ISO conformity and append 'Z' offset
    parsedDateString = dateString.includes('T')
      ? `${dateString}Z`
      : `${dateString.replace(' ', 'T')}Z`;
  }

  const date = new Date(parsedDateString);

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPercentage = (num) => {
  if (num == null) return '0%';
  return `${Math.round(num)}%`;
};

export const getAtsScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
};
