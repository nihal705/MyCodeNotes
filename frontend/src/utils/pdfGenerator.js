import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ==========================================================
// COLOR PALETTE (matches the MyCodeNotes brand)
// ==========================================================
const COLORS = {
  primary: [255, 161, 22],     // #FFA116 - brand orange
  primaryLight: [255, 237, 213], // soft orange tint for backgrounds/badges
  dark: [31, 41, 55],          // #1F2937 - near-black text
  gray: [107, 114, 128],       // secondary text
  grayLight: [156, 163, 175],  // muted text
  border: [229, 224, 214],     // warm hairline (matches original 200,180,150 family)
  codeBg: [247, 247, 250],     // light code block background
  codeText: [55, 65, 81],
  sectionBg: [255, 250, 240],  // very light orange tint for section header bars
};

export const downloadNoteAsPDF = async (note) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // usable width between both margins
  let y = margin + 10;

  // ==========================================================
  // 1. HEADER & FOOTER
  // ==========================================================
  const drawHeaderFooter = () => {
    // top hairline
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, 10, pageWidth - margin, 10);

    // bottom hairline
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    // footer branding (left)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.grayLight);
    doc.text('MyCodeNotes', margin, pageHeight - 6);
  };

  // ==========================================================
  // 2. TEXT HELPER (fixed: wraps within BOTH margins, not past the right edge)
  // ==========================================================
  const addText = (text, fontSize = 12, indent = 0, isBold = false, align = 'left', color = COLORS.dark) => {
    const applyStyle = () => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
    };
    applyStyle();

    const wrapWidth = contentWidth - indent;
    const lines = doc.splitTextToSize(text, wrapWidth);

    lines.forEach(line => {
      if (y + 8 > pageHeight - margin - 5) {
        doc.addPage();
        y = margin + 10;
        drawHeaderFooter();
        applyStyle(); // drawHeaderFooter() changes the active color/font — restore ours
      }
      if (align === 'center') {
        doc.text(line, pageWidth / 2, y, { align: 'center' });
      } else {
        doc.text(line, margin + indent, y);
      }
      y += 6;
    });
    return y;
  };

  // ==========================================================
  // 3. SECTION HEADER (colored bar used for Chapter / Project titles)
  // ==========================================================
  const drawSectionHeader = (label, title) => {
    const barHeight = 16;
    doc.setFillColor(...COLORS.dark);
    doc.roundedRect(margin, y - 5, contentWidth, barHeight, 1.5, 1.5, 'F');

    // orange accent tab on the left edge
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y - 5, 4, barHeight, 1.5, 1.5, 'F');
    doc.rect(margin + 2, y - 5, 2, barHeight, 'F'); // square off the inner edge of the tab

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(label.toUpperCase(), margin + 8, y);

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(title, contentWidth - 16);
    doc.text(titleLines[0], margin + 8, y + 6.5);

    y += barHeight + 10;
  };

  // ==========================================================
  // 4. COVER PAGE
  // ==========================================================
  drawHeaderFooter();

  // soft orange band across the top of the cover for visual interest
  doc.setFillColor(...COLORS.sectionBg);
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 11, pageWidth, 1.2, 'F');

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dark);
  const titleLines = doc.splitTextToSize(note.title, contentWidth);
  let titleY = 60;
  titleLines.forEach(line => {
    doc.text(line, pageWidth / 2, titleY, { align: 'center' });
    titleY += 11;
  });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray);
  doc.text('A Comprehensive Handbook', pageWidth / 2, titleY + 4, { align: 'center' });

  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 20, titleY + 12, pageWidth / 2 + 20, titleY + 12);

  if (note.description) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COLORS.gray);
    const descLines = doc.splitTextToSize(note.description, contentWidth - 20);
    let descY = titleY + 24;
    descLines.forEach(line => {
      doc.text(line, pageWidth / 2, descY, { align: 'center' });
      descY += 7;
    });
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.grayLight);
  doc.text('Created by G Nihal', pageWidth / 2, pageHeight - 20, { align: 'center' });

  try {
    const logoPath = window.location.origin + '/logo.png';
    const res = await fetch(logoPath);
    if (!res.ok) throw new Error('Logo not found');

    // logo.png is 800x128 (aspect ratio 6.25:1) — size it proportionally
    // instead of forcing it into a square, or it gets squished.
    const logoWidth = 90;
    const logoHeight = logoWidth / 6.25;

    doc.addImage(
      logoPath,
      'PNG',
      pageWidth / 2 - logoWidth / 2,
      160,
      logoWidth,
      logoHeight
    );
  } catch (e) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('MyCodeNotes', pageWidth / 2, 170, { align: 'center' });
  }

  // soft orange band across the bottom of the cover
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, pageHeight - 13.2, pageWidth, 1.2, 'F');
  doc.setFillColor(...COLORS.sectionBg);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  // ==========================================================
  // 5. TABLE OF CONTENTS
  // ==========================================================
  const hasChapters = note.content.chapters && note.content.chapters.length > 0;
  const hasProjects = note.content.projects && note.content.projects.length > 0;

  if (hasChapters || hasProjects) {
    doc.addPage();
    y = margin + 15;
    drawHeaderFooter();

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.dark);
    doc.text('Table of Contents', margin, y);
    y += 8;

    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 30, y);
    y += 12;

    if (hasChapters) {
      note.content.chapters.forEach((chapter, cIndex) => {
        if (y > pageHeight - margin - 15) {
          doc.addPage();
          y = margin + 10;
          drawHeaderFooter();
        }

        // numbered badge
        doc.setFillColor(...COLORS.primaryLight);
        doc.circle(margin + 3, y - 2, 3.2, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text(String(cIndex + 1), margin + 3, y - 0.7, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(chapter.title, margin + 9, y);
        y += 7;

        chapter.topics.forEach((topic, tIndex) => {
          doc.setFontSize(10.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.gray);
          doc.text(`${cIndex + 1}.${tIndex + 1}  ${topic.title}`, margin + 12, y);
          y += 6;
          if (y > pageHeight - margin - 5) {
            doc.addPage();
            y = margin + 10;
            drawHeaderFooter();
          }
        });
        y += 4;
      });
    }

    if (hasProjects) {
      note.content.projects.forEach((project, index) => {
        if (y > pageHeight - margin - 15) {
          doc.addPage();
          y = margin + 10;
          drawHeaderFooter();
        }

        doc.setFillColor(...COLORS.primaryLight);
        doc.circle(margin + 3, y - 2, 3.2, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text(String(index + 1), margin + 3, y - 0.7, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.dark);
        doc.text(project.name, margin + 9, y);
        y += 8;
      });
    }
  }

  // ==========================================================
  // 6. PRINT CODE (shaded block, wraps within both margins)
  // ==========================================================
  const printCode = (code, language = null, showLanguage = false) => {
    if (!code || code.trim() === '') return;

    const codePadding = 4;
    const wrapWidth = contentWidth - codePadding * 2;
    const lines = doc.splitTextToSize(code, wrapWidth);

    if (y + 10 > pageHeight - margin - 5) {
      doc.addPage();
      y = margin + 10;
      drawHeaderFooter();
    }

    if (showLanguage && language) {
      // small language chip
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      const chipText = language.toUpperCase();
      const chipWidth = doc.getTextWidth(chipText) + 6;
      doc.setFillColor(...COLORS.dark);
      doc.roundedRect(margin, y - 4, chipWidth, 6, 1, 1, 'F');
      doc.setTextColor(...COLORS.primary);
      doc.text(chipText, margin + 3, y);
      y += 8;
    }

    const applyCodeStyle = () => {
      doc.setFontSize(9.5);
      doc.setFont('courier', 'normal');
      doc.setTextColor(...COLORS.codeText);
    };
    applyCodeStyle();

    // measure block height, paging as needed, drawing background per-page chunk
    let i = 0;
    while (i < lines.length) {
      if (y + 6 > pageHeight - margin - 5) {
        doc.addPage();
        y = margin + 10;
        drawHeaderFooter();
        applyCodeStyle(); // drawHeaderFooter() changes the active color/font — restore ours
      }

      // how many lines fit on this page from here
      const remainingSpace = pageHeight - margin - 5 - y;
      const linesThatFit = Math.max(1, Math.floor(remainingSpace / 6));
      const chunk = lines.slice(i, i + linesThatFit);

      const blockHeight = chunk.length * 6 + codePadding * 2 - 2;
      doc.setFillColor(...COLORS.codeBg);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y - 5, contentWidth, blockHeight, 1.5, 1.5, 'FD');

      let lineY = y;
      applyCodeStyle(); // roundedRect() above doesn't touch text state, but keep this authoritative
      chunk.forEach(line => {
        doc.text(line, margin + codePadding, lineY);
        lineY += 6;
      });

      y = lineY + 4;
      i += chunk.length;
    }

    y += 4;
  };

  // ==========================================================
  // 7. MAIN CONTENT - CHAPTERS
  // ==========================================================
  if (note.content.chapters) {
    note.content.chapters.forEach((chapter, cIndex) => {
      doc.addPage();
      y = margin + 10;
      drawHeaderFooter();

      drawSectionHeader(`Chapter ${cIndex + 1}`, chapter.title);

      chapter.topics.forEach((topic) => {
        if (y > pageHeight - margin - 20) {
          doc.addPage();
          y = margin + 10;
          drawHeaderFooter();
        }

        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(topic.title, margin, y);
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.6);
        doc.line(margin, y + 2, margin + 14, y + 2);
        y += 10;

        if (topic.content) {
          addText(topic.content, 11);
        }

        if (topic.code_examples && topic.code_examples.length > 0) {
          topic.code_examples.forEach((ex) => {
            printCode(ex.code, null, false);
          });
        }
        y += 6;
      });
    });
  }

  // ==========================================================
  // 8. MAIN CONTENT - PROJECTS (With GitHub & Vercel Links)
  // ==========================================================
  if (note.content.projects) {
    note.content.projects.forEach((project, index) => {
      doc.addPage();
      y = margin + 10;
      drawHeaderFooter();

      drawSectionHeader(`Project ${index + 1}`, project.name);

      if (project.description) {
        addText(project.description, 11);
        y += 4;
      }

      if (project.tech_stack) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text('Tech Stack', margin, y);
        y += 6;

        // pill-style tags
        let pillX = margin;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        project.tech_stack.forEach((tech) => {
          const pillWidth = doc.getTextWidth(tech) + 6;
          if (pillX + pillWidth > pageWidth - margin) {
            pillX = margin;
            y += 8;
          }
          doc.setFillColor(...COLORS.primaryLight);
          doc.roundedRect(pillX, y - 4.5, pillWidth, 6, 2, 2, 'F');
          doc.setTextColor(...COLORS.dark);
          doc.text(tech, pillX + 3, y);
          pillX += pillWidth + 3;
        });
        y += 10;
      }

      if (project.github_link || project.live_demo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text('Links', margin, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);

        if (project.github_link) {
          doc.setTextColor(...COLORS.gray);
          doc.text('GitHub:', margin, y);
          doc.setTextColor(...COLORS.primary);
          doc.textWithLink(project.github_link, margin + 18, y, { url: project.github_link });
          y += 6;
        }
        if (project.live_demo) {
          doc.setTextColor(...COLORS.gray);
          doc.text('Live Demo:', margin, y);
          doc.setTextColor(...COLORS.primary);
          doc.textWithLink(project.live_demo, margin + 22, y, { url: project.live_demo });
          y += 6;
        }
        y += 4;
      }

      // ==========================================================
      // FILE STRUCTURE
      // ==========================================================
      if (project.file_structure && project.file_structure.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text('File Structure', margin, y);
        y += 7;
        doc.setFontSize(9.5);
        doc.setFont('courier', 'normal');
        project.file_structure.forEach((folder) => {
          if (y > pageHeight - margin - 10) {
            doc.addPage();
            y = margin + 10;
            drawHeaderFooter();
          }
          doc.setFont('courier', 'bold');
          doc.setTextColor(...COLORS.primary);
          doc.text(`[${folder.folder}]`, margin, y);
          y += 6;
          if (folder.files && folder.files.length > 0) {
            const applyFileStyle = () => {
              doc.setFont('courier', 'normal');
              doc.setTextColor(...COLORS.codeText);
            };
            applyFileStyle();
            folder.files.forEach((file) => {
              if (y > pageHeight - margin - 10) {
                doc.addPage();
                y = margin + 10;
                drawHeaderFooter();
                applyFileStyle(); // drawHeaderFooter() changes the active color/font — restore ours
              }
              doc.text(`   - ${file}`, margin, y);
              y += 5;
            });
          }
          y += 2;
        });
        y += 4;
      }

      // ==========================================================
      // CODE FILES
      // ==========================================================
      if (project.code_files && project.code_files.length > 0) {
        project.code_files.forEach((file) => {
          if (file.language === 'image') return;

          doc.addPage();
          y = margin + 10;
          drawHeaderFooter();

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.dark);
          doc.text(file.filename, margin, y);
          y += 8;

          printCode(file.code, file.language || 'code', true);
        });
      }

      // ==========================================================
      // GUIDE
      // ==========================================================
      if (project.guide && project.guide.length > 0) {
        if (y > pageHeight - margin - 20) {
          doc.addPage();
          y = margin + 10;
          drawHeaderFooter();
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text('Project Guide', margin, y);
        y += 8;
        doc.setFontSize(10);
        project.guide.forEach((step) => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.primary);
          const stepLabel = `${step.step}: `;
          doc.text(stepLabel, margin, y);
          const labelWidth = doc.getTextWidth(stepLabel);

          const applyBodyStyle = () => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.dark);
          };
          applyBodyStyle();
          const wrapped = doc.splitTextToSize(step.content, contentWidth - labelWidth);
          wrapped.forEach((line, i) => {
            if (y + 6 > pageHeight - margin - 5) {
              doc.addPage();
              y = margin + 10;
              drawHeaderFooter();
              applyBodyStyle(); // drawHeaderFooter() changes the active color/font — restore ours
            }
            doc.text(line, margin + (i === 0 ? labelWidth : 0), y);
            y += 6;
          });
          y += 4;
        });
      }
    });
  }

  // ==========================================================
  // 9. PAGE NUMBERS (added last, once total page count is known)
  // ==========================================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) { // skip the cover page (page 1)
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.grayLight);
    doc.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // ==========================================================
  // 10. SAVE
  // ==========================================================
  doc.save(`${note.slug}-handbook.pdf`);
};