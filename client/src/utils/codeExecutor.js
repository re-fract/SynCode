export const executeCode = async (code, language, userInput = '') => {
  try {
    switch (language) {
      case 'javascript':
        return executeJavaScript(code);
      
      case 'html':
        return executeHTML(code);
      
      case 'css':
        return executeCSS(code);
      
      case 'python':
      case 'java':
      case 'cpp':
        return await executeServerSideCode(code, language, userInput);
      
      default:
        return {
          output: `Execution for ${language} is not implemented yet.`,
          isError: false
        };
    }
  } catch (error) {
    return {
      output: `Error: ${error.message}`,
      isError: true
    };
  }
};

// Client-side JavaScript execution
const executeJavaScript = (code) => {
  try {
    const outputLines = [];
    const customConsole = {
      log: (...args) => {
        outputLines.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      },
      error: (...args) => {
        outputLines.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      },
      warn: (...args) => {
        outputLines.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
      }
    };

    const sandboxedCode = `
      (function() {
        const console = arguments[0];
        const window = undefined;
        const document = undefined;
        const fetch = undefined;
        const XMLHttpRequest = undefined;
        
        try {
          ${code}
        } catch (error) {
          console.error(error.message);
        }
      })
    `;

    const func = eval(sandboxedCode);
    func(customConsole);

    return {
      output: outputLines.length > 0 ? outputLines.join('\n') : 'Code executed successfully (no output)',
      isError: false
    };
  } catch (error) {
    return {
      output: `JavaScript Error: ${error.message}`,
      isError: true
    };
  }
};

// HTML execution with live preview
const executeHTML = (code) => {
  try {
    // Validate HTML first
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const errors = doc.querySelectorAll('parsererror');
    
    if (errors.length > 0) {
      return {
        output: 'HTML parsing errors found:\n' + Array.from(errors).map(e => e.textContent).join('\n'),
        isError: true
      };
    }

    return {
      output: '',
      isError: false,
      isPreview: true,
      htmlContent: code,
      previewType: 'html'
    };
  } catch (error) {
    return {
      output: `HTML Error: ${error.message}`,
      isError: true
    };
  }
};

// CSS execution with live preview
const executeCSS = (code) => {
  try {
    // Basic CSS validation
    if (code.trim().length === 0) {
      return {
        output: 'No CSS code provided.',
        isError: false
      };
    }
    
    // Check for basic CSS syntax
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return {
        output: 'CSS Syntax Error: Mismatched braces { }',
        isError: true
      };
    }

    // Create sample HTML with the CSS applied
    const sampleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
        ${code}
    </style>
</head>
<body>
    <div class="container">
        <h1>CSS Preview</h1>
        <p>This is a paragraph to demonstrate your CSS styles.</p>
        <div class="box">Sample Box</div>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
        <button>Sample Button</button>
        <input type="text" placeholder="Sample Input" />
    </div>
</body>
</html>`;

    return {
      output: '',
      isError: false,
      isPreview: true,
      htmlContent: sampleHTML,
      previewType: 'css'
    };
  } catch (error) {
    return {
      output: `CSS Error: ${error.message}`,
      isError: true
    };
  }
};

// Server-side code execution
const executeServerSideCode = async (code, language, userInput = '') => {
  try {
    console.log('Making API request to server...');
    console.log('Input being sent:', userInput);
    
    const requestData = {
      code: code,
      language: language,
      input: userInput
    };
    
    console.log('Request data:', requestData);
    
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const response = await fetch(`${serverUrl}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      mode: 'cors',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Server response:', result);
    
    if (result.success) {
      return {
        output: result.output,
        isError: result.error ? true : false
      };
    } else {
      return {
        output: result.output || result.error,
        isError: true
      };
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      output: `Server execution error: ${error.message}\n\nMake sure your server is running on ${serverUrl}`,
      isError: true
    };
  }
};
