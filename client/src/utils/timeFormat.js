export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const formatDays = (daysString) => {
  if (!daysString) return '';
  let formatted = daysString
    .replace(/Monday/gi, 'Mon')
    .replace(/Tuesday/gi, 'Tue')
    .replace(/Wednesday/gi, 'Wed')
    .replace(/Thursday/gi, 'Thu')
    .replace(/Friday/gi, 'Fri')
    .replace(/Saturday/gi, 'Sat')
    .replace(/Sunday/gi, 'Sun');
    
  const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Split by both comma and slash to handle mixed formats like "Tue/Thu, Monday"
  const rawParts = formatted.split(/[,/]+/).map(s => s.trim()).filter(Boolean);
  
  // Filter out any invalid parts and deduplicate
  let validParts = rawParts.filter(p => orderedDays.includes(p));
  validParts = [...new Set(validParts)];
  
  // Sort according to standard week order
  validParts.sort((a, b) => orderedDays.indexOf(a) - orderedDays.indexOf(b));
  
  if (validParts.length >= 2) {
    if (validParts.join(',') === 'Mon,Wed,Fri') return 'Mon/Wed/Fri';
    if (validParts.join(',') === 'Tue,Thu') return 'Tue/Thu';
    
    // Group into consecutive chunks
    const chunks = [];
    let currentChunk = [validParts[0]];
    
    for (let i = 1; i < validParts.length; i++) {
        const prevIndex = orderedDays.indexOf(validParts[i-1]);
        const currIndex = orderedDays.indexOf(validParts[i]);
        if (currIndex === prevIndex + 1) {
            currentChunk.push(validParts[i]);
        } else {
            chunks.push(currentChunk);
            currentChunk = [validParts[i]];
        }
    }
    chunks.push(currentChunk);
    
    // Format chunks
    const formattedChunks = chunks.map(chunk => {
        if (chunk.length >= 3) {
            return `${chunk[0]}-${chunk[chunk.length - 1]}`;
        }
        return chunk.join(', ');
    });
    
    return formattedChunks.join(', ');
  }
  
  return validParts.length > 0 ? validParts[0] : formatted;
};

export const formatSchedule = (days, start, end) => {
  if (!days || !start || !end) return 'Timing TBD';
  return `${formatDays(days)} ${formatTime(start)} - ${formatTime(end)}`;
};
