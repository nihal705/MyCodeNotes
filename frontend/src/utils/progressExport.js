import jsPDF from "jspdf";

export function downloadProgressCSV(data) {
  const rows = [];
  rows.push(["MyCodeNotes Progress Export"]);
  rows.push(["User", data.user.name, data.user.email]);
  rows.push(["Generated", data.generated_at]);
  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Solved", data.stats.overall.solved, "Total", data.stats.overall.total, "Percent", data.stats.overall.percent + "%"]);
  rows.push(["Current Streak", data.streak.current, "Longest", data.streak.longest, "Active Days", data.streak.active_days]);
  rows.push([]);
  rows.push(["Difficulty Breakdown"]);
  rows.push(["Difficulty", "Solved", "Total"]);
  Object.entries(data.stats.leetcode.by_difficulty).forEach(([d, v]) => {
    rows.push([d, v.solved, v.total]);
  });
  rows.push([]);
  rows.push(["Goals"]);
  rows.push(["Title", "Target", "Solved", "Progress %", "Status"]);
  data.goals.forEach((g) => rows.push([g.title, g.target_count, g.solved_count, g.progress_percent, g.status]));
  rows.push([]);
  rows.push(["Mock Tests"]);
  rows.push(["Title", "Score", "Total", "Status", "Date"]);
  data.mock_tests.forEach((m) => rows.push([m.title, m.score, m.total, m.status, new Date(m.created_at).toLocaleString()]));

  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mycodenotes-progress-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadProgressPDF(data) {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;
  let y = M;

  // Cover band
  doc.setFillColor(10, 15, 23);
  doc.rect(0, 0, W, 24, "F");
  doc.setFillColor(255, 161, 22);
  doc.rect(0, 24, W, 1.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("MyCodeNotes", M, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("Progress Report", W - M, 13, { align: "right" });
  y = 34;

  // Meta
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.user.name, M, y); y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(data.user.email, M, y); y += 5;
  doc.text(`Generated: ${new Date(data.generated_at).toLocaleString()}`, M, y); y += 9;

  // Summary cards
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  const cardW = (W - M * 2 - 6) / 3;
  const drawCard = (x, label, value, sub) => {
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(x, y, cardW, 22, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(label.toUpperCase(), x + 3, y + 5);
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), x + 3, y + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(sub || "", x + 3, y + 19);
  };
  drawCard(M, "Solved", data.stats.overall.solved, `of ${data.stats.overall.total}`);
  drawCard(M + cardW + 3, "Completion", `${data.stats.overall.percent}%`, "overall");
  drawCard(M + (cardW + 3) * 2, "Streak", data.streak.current, `longest ${data.streak.longest}`);
  y += 30;

  // Difficulty breakdown
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("LeetCode by difficulty", M, y); y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  Object.entries(data.stats.leetcode.by_difficulty).forEach(([d, v]) => {
    doc.setTextColor(31, 41, 55);
    doc.text(d, M, y);
    doc.setTextColor(107, 114, 128);
    doc.text(`${v.solved} / ${v.total}`, W - M, y, { align: "right" });
    y += 4;
    doc.setFillColor(243, 244, 246);
    doc.rect(M, y, W - M * 2, 1.8, "F");
    const pct = v.total > 0 ? v.solved / v.total : 0;
    doc.setFillColor(255, 161, 22);
    doc.rect(M, y, (W - M * 2) * pct, 1.8, "F");
    y += 6;
  });
  y += 4;

  // Goals
  if (data.goals.length) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Study goals", M, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    data.goals.forEach((g) => {
      if (y > H - 30) { doc.addPage(); y = M + 10; }
      doc.setTextColor(31, 41, 55);
      doc.text(g.title.slice(0, 70), M, y);
      doc.setTextColor(107, 114, 128);
      doc.text(`${g.solved_count}/${g.target_count} · ${g.progress_percent}%`, W - M, y, { align: "right" });
      y += 5;
    });
    y += 4;
  }

  // Mock tests
  if (data.mock_tests.length) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text("Recent mock tests", M, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    data.mock_tests.slice(0, 10).forEach((m) => {
      if (y > H - 20) { doc.addPage(); y = M + 10; }
      doc.setTextColor(31, 41, 55);
      doc.text(m.title.slice(0, 60), M, y);
      doc.setTextColor(107, 114, 128);
      doc.text(`${m.score}/${m.total} · ${m.status}`, W - M, y, { align: "right" });
      y += 5;
    });
  }

  // Footer
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${total}`, W - M, H - 8, { align: "right" });
    doc.text("MyCodeNotes · Progress Report", M, H - 8);
  }

  doc.save(`mycodenotes-progress-${Date.now()}.pdf`);
}