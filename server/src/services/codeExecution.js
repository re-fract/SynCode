const fetch = require('node-fetch');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const languageMap = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  css: { language: 'javascript', version: '18.15.0' },
  html: { language: 'javascript', version: '18.15.0' },
};

const executeCode = async (language, sourceCode, userInput = '') => {
  try {
    // Handle HTML/CSS differently - create preview instead of execution
    if (language === 'html' || language === 'css') {
      return {
        success: true,
        output: 'HTML/CSS preview generated successfully',
        isPreview: true,
        htmlContent: language === 'html' ? sourceCode : `<style>${sourceCode}</style>`
      };
    }

    const config = languageMap[language];
    if (!config) {
      throw new Error(`Language ${language} is not supported`);
    }

    console.log(`Executing ${language} code via Piston API...`);
    console.log('User input provided:', userInput ? 'Yes' : 'No');
    console.log('Input length:', userInput ? userInput.length : 0);

    let modifiedSourceCode = sourceCode;

    // For languages that support input, if we have user input, modify the code to include it
    if (userInput && userInput.trim()) {
      if (language === 'python') {
        // Replace input() calls with predefined inputs
        const inputs = userInput.trim().split('\n').filter(line => line.trim() !== '');
        console.log('Python inputs:', inputs);
        
        // Create a mock input function that returns predefined values
        const inputSetup = `# Mock input function with predefined values
__inputs = ${JSON.stringify(inputs)}
__input_index = 0
def input(prompt=""):
    global __input_index
    print(prompt, end="")
    if __input_index < len(__inputs):
        value = __inputs[__input_index]
        __input_index += 1
        print(value)
        return value
    return ""

`;
        modifiedSourceCode = inputSetup + sourceCode;
        console.log('Modified Python code with mock input');
      }
    }

    const requestBody = {
      language: config.language,
      version: config.version,
      files: [
        {
          name: `main.${getFileExtension(language)}`,
          content: modifiedSourceCode,
        },
      ],
      compile_timeout: 10000,
      run_timeout: 3000,
    };

    console.log('=== CODE EXECUTION DEBUG ===');
    console.log('Modified code:', modifiedSourceCode);
    console.log('============================');

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Execution completed for ${language}`);
    console.log('Output:', data.run?.stdout);
    console.log('Errors:', data.run?.stderr);
    
    return {
      success: true,
      output: data.run.stdout || data.run.stderr || 'Code executed successfully (no output)',
      error: data.run.stderr || null,
      exitCode: data.run.code,
    };
  } catch (error) {
    console.error(`Code execution failed for ${language}:`, error.message);
    return {
      success: false,
      error: error.message,
      output: `Execution failed: ${error.message}`,
    };
  }
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    html: 'html',
    css: 'css',
  };
  return extensions[language] || 'txt';
};

module.exports = { executeCode };
