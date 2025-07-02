const express = require('express');
const router = express.Router();

const { executeCode } = require('../services/codeExecution');

router.post('/execute', async (req, res) => {
  try {
    console.log('=== EXECUTE ROUTE DEBUG ===');
    console.log('Received execute request:', req.body);
    console.log('============================');
    
    const { code, language, input } = req.body;
    
    // Validate input
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }
    
    console.log(`Code execution request: ${language} (${code.length} characters)`);
    console.log('Input parameter:', JSON.stringify(input));
    
    // Execute code using your existing service - ENSURE input is passed!
    const result = await executeCode(language, code, input);
    
    console.log('Execution result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        output: result.output,
        error: result.error || null,
        isPreview: result.isPreview || false,
        htmlContent: result.htmlContent || null
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        output: result.output
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      output: `Server error: ${error.message}`
    });
  }
});

module.exports = router;
