export class ExportUtils {
  async copyResults(originalText, changedText, aiResults) {
    let textToCopy = `QUICKDIFF COMPARISON RESULTS\n${'='.repeat(50)}\n\n`;
    textToCopy += `Original Text:\n${'-'.repeat(20)}\n${originalText}\n\n`;
    textToCopy += `Changed Text:\n${'-'.repeat(20)}\n${changedText}\n\n`;
    
    if (aiResults && aiResults.length > 0) {
      textToCopy += `AI ANALYSIS RESULTS\n${'='.repeat(50)}\n\n`;
      aiResults.forEach(result => {
        textToCopy += `${result.title}\n${'-'.repeat(result.title.length)}\n`;
        textToCopy += this.stripHtml(result.content) + '\n\n';
      });
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      return Promise.resolve();
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  }

  exportToTxt(originalText, changedText, diffResult, aiResults) {
    let content = `QUICKDIFF COMPARISON RESULTS\n${'='.repeat(50)}\n\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n\n`;
    content += `Original Text:\n${'-'.repeat(20)}\n${originalText}\n\n`;
    content += `Changed Text:\n${'-'.repeat(20)}\n${changedText}\n\n`;
    
    // Add comparison summary
    if (diffResult && diffResult.stats) {
      const stats = diffResult.stats;
      content += `COMPARISON SUMMARY\n${'-'.repeat(20)}\n`;
      content += `Added: ${stats.linesAdded || stats.wordsAdded || stats.charactersAdded || 0}\n`;
      content += `Removed: ${stats.linesRemoved || stats.wordsRemoved || stats.charactersRemoved || 0}\n`;
      content += `Modified: ${stats.linesModified || 0}\n\n`;
    }
    
    if (aiResults && aiResults.length > 0) {
      content += `AI ANALYSIS RESULTS\n${'='.repeat(50)}\n\n`;
      aiResults.forEach(result => {
        content += `${result.title}\n${'-'.repeat(result.title.length)}\n`;
        content += this.stripHtml(result.content) + '\n\n';
      });
    }
    
    this.downloadFile(content, 'quickdiff-comparison.txt', 'text/plain');
  }

  exportToHtml(originalText, changedText, diffResult, aiResults) {
    const aiResultsHtml = aiResults && aiResults.length > 0 
      ? aiResults.map(result => `
          <div class="ai-card">
            <div class="ai-card-header">${result.title}</div>
            <div class="ai-card-content">${result.content}</div>
          </div>
        `).join('')
      : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickDiff - Text Comparison Results</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4facfe; }
        .header h1 { color: #2c3e50; margin: 0; }
        .timestamp { color: #6c757d; font-size: 0.9rem; margin-top: 10px; }
        .text-section { margin: 20px 0; }
        .text-section h2 { color: #4facfe; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
        .text-content { background: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap; font-family: monospace; }
        .ai-section { margin-top: 40px; }
        .ai-section h2 { color: #000000; border-bottom: 2px solid #B6B09F; padding-bottom: 10px; }
        .ai-card { background: #F2F2F2; border: 1px solid #B6B09F; border-radius: 8px; margin: 20px 0; overflow: hidden; }
        .ai-card-header { background: #000000; color: white; padding: 15px 20px; font-weight: 600; }
        .ai-card-content { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ QuickDiff - Text Comparison Results</h1>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="text-section">
            <h2>📄 Original Text</h2>
            <div class="text-content">${this.escapeHtml(originalText)}</div>
        </div>
        
        <div class="text-section">
            <h2>📝 Changed Text</h2>
            <div class="text-content">${this.escapeHtml(changedText)}</div>
        </div>
        
        ${aiResultsHtml ? `
        <div class="ai-section">
            <h2>🧠 AI Analysis Results</h2>
            ${aiResultsHtml}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 0.9rem;">
            Generated by QuickDiff React - Advanced Text Comparison Tool
        </div>
    </div>
</body>
</html>`;
    
    this.downloadFile(htmlContent, 'quickdiff-comparison.html', 'text/html');
  }

  exportToMarkdown(originalText, changedText, diffResult, aiResults) {
    let mdContent = `# ⚡ QuickDiff - Text Comparison Results

*Generated on: ${new Date().toLocaleString()}*

---

## 📄 Original Text

\`\`\`
${originalText}
\`\`\`

## 📝 Changed Text

\`\`\`
${changedText}
\`\`\`

## 📊 Comparison Summary

`;
    
    if (diffResult && diffResult.stats) {
      const stats = diffResult.stats;
      mdContent += `| Metric | Count |
|--------|-------|
| Added | ${stats.linesAdded || stats.wordsAdded || stats.charactersAdded || 0} |
| Removed | ${stats.linesRemoved || stats.wordsRemoved || stats.charactersRemoved || 0} |
| Modified | ${stats.linesModified || 0} |

`;
    }
    
    if (aiResults && aiResults.length > 0) {
      mdContent += `---

## 🧠 AI Analysis Results

`;
      aiResults.forEach(result => {
        mdContent += `### ${result.title}

${this.stripHtml(result.content)}

`;
      });
    }
    
    mdContent += `
---

*Generated by QuickDiff React - Advanced Text Comparison Tool*`;
    
    this.downloadFile(mdContent, 'quickdiff-comparison.md', 'text/markdown');
  }

  exportToPdf(originalText, changedText, diffResult, aiResults) {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      console.log('jsPDF not available, using fallback method');
      this.exportToPdfFallback(originalText, changedText, diffResult, aiResults);
      return;
    }
    
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF();
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('QuickDiff React - Text Comparison Results', margin, yPosition);
    yPosition += 12;
    
    // Timestamp
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 15;
    
    // Add separator line
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Original Text Section
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Original Text:', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    const originalLines = doc.splitTextToSize(originalText || 'No content provided', contentWidth);
    
    for (let i = 0; i < originalLines.length; i++) {
      checkPageBreak(6);
      doc.text(originalLines[i], margin, yPosition);
      yPosition += 4;
    }
    yPosition += 10;
    
    // Changed Text Section
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Changed Text:', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    const changedLines = doc.splitTextToSize(changedText || 'No content provided', contentWidth);
    
    for (let i = 0; i < changedLines.length; i++) {
      checkPageBreak(6);
      doc.text(changedLines[i], margin, yPosition);
      yPosition += 4;
    }
    yPosition += 15;
    
    // Add AI results if available
    if (aiResults && aiResults.length > 0) {
      checkPageBreak(30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Analysis Results:', margin, yPosition);
      yPosition += 10;
      
      aiResults.forEach(result => {
        checkPageBreak(20);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(result.title, margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const cleanContent = this.stripHtml(result.content);
        const contentLines = doc.splitTextToSize(cleanContent, contentWidth);
        
        for (let i = 0; i < contentLines.length; i++) {
          checkPageBreak(5);
          doc.text(contentLines[i], margin, yPosition);
          yPosition += 4;
        }
        yPosition += 10;
      });
    }
    
    doc.save('quickdiff-react-comparison.pdf');
  }

  exportToPdfFallback(originalText, changedText, diffResult, aiResults) {
    const aiResultsHtml = aiResults && aiResults.length > 0 
      ? aiResults.map(result => `
          <div class="ai-card">
            <div class="ai-card-header">${result.title}</div>
            <div class="ai-card-content">${this.stripHtml(result.content)}</div>
          </div>
        `).join('')
      : '';

    const printWindow = window.open('', '_blank');
    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>QuickDiff React - Text Comparison Results</title>
    <style>
        @media print {
            body { margin: 0; padding: 20px; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            .section { margin: 15px 0; }
            h1, h2, h3 { page-break-after: avoid; }
            .text-content { page-break-inside: avoid; }
        }
        
        body { font-family: 'Times New Roman', serif; line-height: 1.5; margin: 20px; color: #333; font-size: 12pt; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .header h1 { font-size: 18pt; font-weight: bold; margin: 0 0 10px 0; color: #000; }
        .header p { font-size: 10pt; margin: 5px 0; color: #666; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section h2 { font-size: 14pt; font-weight: bold; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin: 15px 0 10px 0; }
        .text-content { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 3px; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.3; margin: 10px 0; }
        .ai-card { margin: 15px 0; border: 1px solid #ddd; border-radius: 3px; overflow: hidden; page-break-inside: avoid; }
        .ai-card-header { background: #f0f0f0; color: #000; padding: 10px 15px; font-weight: bold; font-size: 12pt; border-bottom: 1px solid #ddd; }
        .ai-card-content { padding: 15px; font-size: 11pt; line-height: 1.4; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; font-size: 10pt; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>QuickDiff React - Text Comparison Results</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>Original Text</h2>
        <div class="text-content">${this.escapeHtml(originalText || 'No content provided')}</div>
    </div>
    
    <div class="section">
        <h2>Changed Text</h2>
        <div class="text-content">${this.escapeHtml(changedText || 'No content provided')}</div>
    </div>
    
    ${aiResultsHtml ? `
    <div class="section ai-section page-break">
        <h2>AI Analysis Results</h2>
        ${aiResultsHtml}
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Generated by QuickDiff React - Advanced Text Comparison Tool</p>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px;">
        <h3>Export Options</h3>
        <p>Use your browser's print function to save as PDF</p>
        <button onclick="window.print()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 5px;">Print / Save as PDF</button>
        <button onclick="window.close()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin: 5px;">Close Window</button>
    </div>
</body>
</html>`;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}