// Test script to debug auto-detect issues
import { LanguageDetector } from './src/utils/LanguageDetector.js';

const detector = new LanguageDetector();

// Test cases
const testCases = [
  {
    name: 'JavaScript',
    content: `function hello() {
      console.log("Hello World");
      const x = 10;
      return x;
    }`,
    expected: 'javascript'
  },
  {
    name: 'Python',
    content: `def hello():
    print("Hello World")
    x = 10
    return x`,
    expected: 'python'
  },
  {
    name: 'HTML',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`,
    expected: 'html'
  },
  {
    name: 'CSS',
    content: `.container {
    background-color: #fff;
    margin: 10px;
    padding: 20px;
}`,
    expected: 'css'
  },
  {
    name: 'Java',
    content: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
    expected: 'java'
  }
];

console.log('Testing Language Detection...');
testCases.forEach(test => {
  const result = detector.autoDetect(test.content);
  console.log(`${test.name}: Expected ${test.expected}, Got ${result.language} (${result.confidence})`);
});