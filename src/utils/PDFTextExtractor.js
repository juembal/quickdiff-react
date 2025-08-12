/**
 * PDF Text Extraction Utility
 * Handles extracting text content from PDF files for comparison
 */

class PDFTextExtractor {
  constructor() {
    this.pdfjs = null;
    this.isLoaded = false;
  }

  async loadPDFJS() {
    if (this.isLoaded) return;

    try {
      // Load PDF.js from CDN
      if (!window.pdfjsLib) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        
        // Configure PDF.js worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      this.pdfjs = window.pdfjsLib;
      this.isLoaded = true;
      console.log('PDF.js loaded successfully');
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
      throw new Error('PDF processing library failed to load');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async extractTextFromPDF(file) {
    try {
      await this.loadPDFJS();

      // Convert file to ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file);
      
      // Load PDF document
      const pdf = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      console.log(`Processing PDF with ${totalPages} pages...`);

      // Extract text from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine text items from the page
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .trim();
          
          if (pageText) {
            fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
          }
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          fullText += `\n--- Page ${pageNum} (Error reading content) ---\n`;
        }
      }

      if (!fullText.trim()) {
        throw new Error('No text content found in PDF');
      }

      return {
        success: true,
        text: fullText.trim(),
        pages: totalPages,
        message: `Successfully extracted text from ${totalPages} page(s)`
      };

    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return {
        success: false,
        text: '',
        error: error.message || 'Failed to extract text from PDF',
        message: 'PDF text extraction failed'
      };
    }
  }

  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Check if a file is a PDF
  isPDFFile(file) {
    return file.type === 'application/pdf' || 
           file.name.toLowerCase().endsWith('.pdf');
  }

  // Get supported file types
  getSupportedTypes() {
    return {
      text: ['.txt', '.md', '.json', '.html', '.js', '.py', '.css', '.xml', '.csv', '.log'],
      pdf: ['.pdf'],
      all: ['.txt', '.md', '.json', '.html', '.js', '.py', '.css', '.xml', '.csv', '.log', '.pdf']
    };
  }

  // Get accept attribute for file input
  getAcceptAttribute() {
    const types = this.getSupportedTypes();
    return [...types.text, ...types.pdf].join(',');
  }
}

export default PDFTextExtractor;