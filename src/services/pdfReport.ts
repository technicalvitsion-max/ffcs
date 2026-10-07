import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { HourRequest, Student } from "@/lib/types";

export class PDFReportService {
  static generateStudentReport(
    student: Partial<Student> & { name: string; registrationNumber: string; phone?: string },
    requests: HourRequest[]
  ) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Calculate approved hours
    const approvedSum = requests
      .filter((r) => r.status?.toLowerCase() === "approved")
      .reduce((sum, r) => sum + (Number(r.hours) || 0), 0);

    const approvedHours =
      student.hours !== undefined && student.hours !== null && student.hours > 0
        ? student.hours
        : approvedSum;

    // --- PAGE 1: HEADER & PROFILE & APPROVED HOURS ---
    // Dark slate banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VITSION CLUB", margin, 16);

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("FFCS ACTIVITY & PERFORMANCE REPORT", margin, 24);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Report Generated: ${today}`, margin, 31);

    // Official Document Tag
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - margin - 45, 10, 45, 18, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL RECORD", pageWidth - margin - 22.5, 17.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("FFCS 2026-2027", pageWidth - margin - 22.5, 23.5, { align: "center" });

    // Student Profile Card
    let yPos = 48;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPos, contentWidth, 36, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("STUDENT PROFILE", margin + 6, yPos + 8);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text((student.name || "").toUpperCase(), margin + 6, yPos + 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Register No: ", margin + 6, yPos + 26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(student.registrationNumber || "", margin + 28, yPos + 26);

    // Contact info (Column 2)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Email: ", margin + 85, yPos + 17);
    doc.setTextColor(15, 23, 42);
    doc.text(student.email || "N/A", margin + 98, yPos + 17);

    doc.setTextColor(100, 116, 139);
    doc.text("Mobile: ", margin + 85, yPos + 26);
    doc.setTextColor(15, 23, 42);
    doc.text(student.mobile || student.phone || "N/A", margin + 100, yPos + 26);

    // Total Approved Hours Card
    yPos += 44;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, yPos, contentWidth, 32, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL APPROVED HOURS", margin + 6, yPos + 9);

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`${approvedHours} hrs`, margin + 6, yPos + 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("ISSUING BODY", margin + 120, yPos + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("VITSION Club, VIT", margin + 120, yPos + 20);

    // --- PAGE 2: ITEMIZED WORK LOG TABLE & SIGN-OFF ---
    doc.addPage();

    const p2Y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("ITEMIZED WORK LOG & APPROVAL HISTORY", margin, p2Y);

    const sortedRequests = [...requests].sort((a, b) => {
      return (
        new Date(b.date || b.submitted || 0).getTime() -
        new Date(a.date || a.submitted || 0).getTime()
      );
    });

    const tableRows = sortedRequests.map((req, idx) => {
      const statusUpper = req.status ? req.status.toUpperCase() : "PENDING";
      return [
        String(idx + 1),
        req.date || req.submitted || "-",
        req.workName || "-",
        req.workSlab || "-",
        req.workType || "-",
        `${req.hours || 0}h`,
        statusUpper,
      ];
    });

    autoTable(doc, {
      startY: p2Y + 4,
      head: [["#", "Date", "Work Name", "Slab", "Type", "Hours", "Status"]],
      body:
        tableRows.length > 0
          ? tableRows
          : [["-", "-", "No logged work entries found", "-", "-", "-", "-"]],
      margin: { left: margin, right: margin },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 22 },
        2: { cellWidth: 34 },
        3: { cellWidth: 34 },
        4: { cellWidth: 42 },
        5: { cellWidth: 15, halign: "center", fontStyle: "bold" },
        6: { cellWidth: 25, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          const val = data.cell.raw;
          if (val === "APPROVED") {
            data.cell.styles.textColor = [22, 101, 52];
          } else if (val === "REJECTED") {
            data.cell.styles.textColor = [185, 28, 28];
          } else {
            data.cell.styles.textColor = [161, 98, 7];
          }
        }
      },
    });

    // Sign-off block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || p2Y + 50;
    const pageHeight = doc.internal.pageSize.getHeight();

    let signOffY = finalY + 16;
    if (signOffY + 30 > pageHeight - margin) {
      doc.addPage();
      signOffY = margin + 10;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, signOffY, pageWidth - margin, signOffY);

    signOffY += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "This document certifies the participation and logged hours of the student in VITSION Club FFCS initiatives.",
      margin,
      signOffY
    );

    signOffY += 16;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Faculty Coordinator", margin + 10, signOffY);
    doc.text("President / Student Head", pageWidth - margin - 50, signOffY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("VITSION Club, VIT", margin + 10, signOffY + 4);
    doc.text("VITSION Club, VIT", pageWidth - margin - 50, signOffY + 4);

    // Save PDF
    const safeRegNo = (student.registrationNumber || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const filename = `FFCS_${safeRegNo}_Report.pdf`;
    doc.save(filename);
  }
}
