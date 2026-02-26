export function computeYearTicks(startYear: number, endYear: number): number[] {
  const range = endYear - startYear;
  let step: number;
  if (range <= 10) step = 1;
  else if (range <= 20) step = 2;
  else if (range <= 40) step = 5;
  else step = 10;

  const ticks: number[] = [];
  const first = Math.ceil(startYear / step) * step;
  for (let y = first; y <= endYear; y += step) {
    ticks.push(y);
  }
  return ticks;
}

export function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0 || i === data.length - 1);
}

export function generateCSV(
  headers: string[],
  rows: (string | number)[][],
): string {
  const headerLine = headers.join(",");
  const body = rows.map((row) =>
    row.map((cell) => {
      const str = String(cell);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(","),
  );
  return [headerLine, ...body].join("\n");
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadChartAsJPEG(
  elementId: string,
  filename: string,
) {
  const { default: html2canvas } = await import("html2canvas-pro");
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,
  });
  const link = document.createElement("a");
  link.download = `${filename}.jpg`;
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
}
