import jsPDF from "jspdf";

const COLORS = {
  primary: [255, 161, 22],
  dark: [17, 24, 39],
  gray: [107, 114, 128],
  light: [243, 244, 246],
  border: [229, 231, 235],
};

export async function downloadChatAsPDF(conversation) {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 5;

  // Header
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 22, pageWidth, 1.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NextraAI Chat Export", margin, 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("MyCodeNotes", pageWidth - margin, 13, { align: "right" });
  y = 32;

  // Meta
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const title = doc.splitTextToSize(conversation.title || "Untitled Chat", contentWidth);
  title.forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });
  y += 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray);
  doc.text(`User: ${conversation.user?.name || "—"} (${conversation.user?.email || "—"})`, margin, y);
  y += 5;
  doc.text(`Date: ${new Date(conversation.created_at).toLocaleString()}`, margin, y);
  y += 8;

  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 30, y);
  y += 8;

  // Messages
  for (const msg of conversation.messages || []) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin + 10;
    }

    const isUser = msg.role === "user";

    // Role badge
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    if (isUser) {
      doc.setTextColor(...COLORS.primary);
      doc.text("USER", margin, y);
    } else {
      doc.setTextColor(34, 197, 94);
      doc.text("NEXTRAAI", margin, y);
    }
    doc.setTextColor(...COLORS.gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(new Date(msg.created_at).toLocaleTimeString(), pageWidth - margin, y, {
      align: "right",
    });
    y += 5;

    // Content
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    const clean = (msg.content || "").replace(/```[\s\S]*?```/g, "[code block]");
    const lines = doc.splitTextToSize(clean, contentWidth);

    for (const line of lines) {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = margin + 10;
      }
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  // Footer
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
    doc.text("MyCodeNotes · NextraAI", margin, pageHeight - 8);
  }

  doc.save(`nextraai-chat-${Date.now()}.pdf`);
}