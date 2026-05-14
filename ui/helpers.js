const programNames = {
  0: "Lärare",
  1: "Annan personal",
  2: "Besökare / Ej knuten till skolan",
  3: "Ekonomiprogrammet",
  4: "Estetiska programmet – Bild och formgivning",
  5: "Estetiska programmet – Modedesign",
  6: "Estetiska programmet – Musik",
  7: "Estetiska programmet – Spetsutbildning (MUV)",
  8: "Naturvetenskapsprogrammet",
  9: "Samhällsvetenskapsprogrammet",
  10: "Teknikprogrammet",
  11: "Barn- och fritidsprogrammet",
  12: "El- och energiprogrammet",
  13: "Fordons- och transportprogrammet",
  14: "Naturbruksprogrammet – Hästhållning",
  15: "Vård- och omsorgsprogrammet",
  16: "Introduktionsprogrammen",
  17: "Gymnasial lärlingsutbildning",
};

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} s`;
  }

  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

function formatProgram(programId) {
  if (programId === null || programId === undefined || programId === "") {
    return "Okänt program";
  }

  return programNames[programId] ?? `Program ${programId}`;
}

function formatRelativeDate(dateValue) {
  const finishDate = new Date(dateValue);

  if (Number.isNaN(finishDate.getTime())) {
    return "Okänt";
  }

  const diffMs = Date.now() - finishDate.getTime();
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "nyss";
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minut sedan" : `${diffMinutes} minuter sedan`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? "1 timme sedan" : `${diffHours} timmar sedan`;
  }

  if (diffDays === 1) return "igår";
  return `${diffDays} dagar sedan`;
}
